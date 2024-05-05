package com.watanabe.karaokeserver.controller;

import static org.springframework.http.HttpStatus.OK;

import com.watanabe.karaokeserver.config.KaraokeConfiguration;
import com.watanabe.karaokeserver.data.karaoke.DirectoryEntry;
import com.watanabe.karaokeserver.data.karaoke.DirectoryEntryRepository;
import com.watanabe.karaokeserver.data.karaoke.KaraokeTrack;
import com.watanabe.karaokeserver.data.karaoke.KaraokeTrackRepository;
import com.watanabe.karaokeserver.data.karaoke.MediaFileLocation;
import com.watanabe.karaokeserver.data.karaoke.MediaFileLocationRepository;
import com.watanabe.karaokeserver.data.karaoke.MediaType;
import com.watanabe.karaokeserver.data.karaoke.QueueItem;
import com.watanabe.karaokeserver.data.karaoke.Search;
import com.watanabe.karaokeserver.util.DirectoryCrawler;
import com.watanabe.karaokeserver.util.TagData;
import com.watanabe.karaokeserver.util.TagParser;
import jakarta.servlet.http.HttpServletResponse;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping(path = "api/assets")
@PreAuthorize("hasRole('ROLE_USER')")
public class AssetController {

  private static final Logger logger = Logger.getLogger(AssetController.class.getName());

  @Autowired
  private KaraokeTrackRepository karaokeTrackRepository;
  @Autowired
  private MediaFileLocationRepository mediaFileLocationRepository;
  @Autowired
  private DirectoryEntryRepository directoryEntryRepository;
  @Autowired
  private KaraokeConfiguration karaokeConfiguration;

  private List<QueueItem> convertTracksToQueueItems(List<KaraokeTrack> tracks) {
    return tracks.stream().map(track -> QueueItem.builder()
        .id(track.get_id())
        .title(track.getTitle())
        .artist(track.getArtist())
        .duration(track.getDuration())
        .build()).toList();
  }

  @PostMapping("/find")
  @ResponseStatus(code = OK)
  List<QueueItem> searchByID(@RequestBody Search search, HttpServletResponse response)
      throws IOException {
    if (search.getSearchString() == null || search.getType() == null) {
      if (search.getType() == null) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "type parameter is mandatory");
      } else {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST,
            "searchString parameter is mandatory");
      }
    }
    return switch (search.getType()) {
      case "artist" -> convertTracksToQueueItems(
          karaokeTrackRepository.getKaraokeTrackByArtist(search.getSearchString()));
      case "title" -> convertTracksToQueueItems(
          karaokeTrackRepository.getKaraokeTrackByTitle(search.getSearchString()));
      default -> {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid type parameter");
        yield null;
      }
    };
  }

  private String getFilePrefix(String pathString) {
    java.nio.file.Path path = Paths.get(pathString);
    String fileName = path.getFileName().toString();
    return fileName.substring(0, fileName.lastIndexOf('.'));
  }

  private List<String> tryToExtractTitleAndArtist(String filename) {
    String[] parts = filename.split("-");
    int partsLength = parts.length;
    if (partsLength >= 2) {

      return List.of(parts[partsLength - 2].trim(), parts[partsLength - 1].trim());
    }
    return List.of(filename, "");
  }

  private ResponseEntity<StreamingResponseBody> getMediaFile(String path, final HttpServletResponse response) {
      final String finalPath = path.replace("\\", "/");
      StreamingResponseBody stream = out -> {
        try (InputStream inputStream = new FileInputStream(finalPath)) {
          OutputStream output = response.getOutputStream();
          inputStream.transferTo(output);
          output.flush();
          output.close();
        }
        catch (IOException e) {
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error reading file");
        }
      };
      return ResponseEntity.ok(stream);
  }

  @GetMapping(value="/id/{id}", produces = "application/octet-stream")
  public ResponseEntity<StreamingResponseBody> loadMediaByID(@PathVariable("id") String id,
      HttpServletResponse response) throws IOException {

    if(id.startsWith("empty"))
    {
      response.setStatus(HttpServletResponse.SC_NO_CONTENT);
      return null;
    }

    String karaokeTrackId = getFilePrefix(id);
    KaraokeTrack track = karaokeTrackRepository.getKaraokeTrackBy_id(karaokeTrackId);

    if (track == null) {
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "Track Not Found");
    }

    MediaFileLocation location;
    if (id.endsWith("cdg")) {
      location = mediaFileLocationRepository.getMediaFileLocationByKaraokeTrackIdAndMediaType(
          karaokeTrackId, MediaType.CDG);
    } else if (id.endsWith("mp3")) {
      location = mediaFileLocationRepository.getMediaFileLocationByKaraokeTrackIdAndMediaType(
          karaokeTrackId, MediaType.MP3);
    } else if (id.endsWith("mp4") || id.endsWith("mpg")) {
      location = mediaFileLocationRepository.getMediaFileLocationByKaraokeTrackIdAndMediaType(
          karaokeTrackId, MediaType.MP4);
    } else {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "invalid media type requested");
      return null;
    }

    return getMediaFile(karaokeConfiguration.getBasePathToAssets() + location.getUri(), response);
  }

  @GetMapping("/scan")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public String scanFileSystem() {
    synchronized (logger) {
      String basePathToAssets = karaokeConfiguration.getBasePathToAssets();
      DirectoryCrawler crawler = new DirectoryCrawler(
          karaokeConfiguration.getBasePathToAssets(), null);

      crawler.startCrawling(file -> {
        final String fileName = file.getName();
        String prefix = getFilePrefix(fileName);
        String path = file.getAbsolutePath();
        path = path.substring(basePathToAssets.length());
        if (path.startsWith("/")) {
          path = path.substring(1);
        }

        MediaType mediaType = MediaType.MP3;
        if (fileName.endsWith("cdg")) {
          mediaType = MediaType.CDG;
        } else if (fileName.endsWith("mp4") || fileName.endsWith("mpg")) {
          mediaType = MediaType.MP4;
        }

        Optional<TagData> optTagData = Optional.empty();
        try {
          if (mediaType == MediaType.MP3) {
            optTagData = TagParser.parseTag(file);
          }
        } catch (Exception e) {
          System.out.println("No ID3 for file: " + file.getAbsolutePath());
        }

        ObjectId karaokeTrackId = null;
        if (optTagData.isPresent()) {
          TagData td = optTagData.get();
          List<KaraokeTrack> tracks = karaokeTrackRepository.getKaraokeTrackByFileNamePrefix(prefix);
          KaraokeTrack track = tracks.size() > 0 ? tracks.getFirst() : null;
          if (track != null) {
            karaokeTrackId = new ObjectId(track.get_id());
          } else {
            karaokeTrackId = new ObjectId(karaokeTrackRepository.save(KaraokeTrack.builder()
                .fileNamePrefix(prefix)
                .title(td.getTitle())
                .artist(td.getArtist())
                .build()).get_id());
          }
          if (karaokeTrackId != null) {
            if (mediaFileLocationRepository.getMediaFileLocationByUriAndMediaType(path, mediaType) == null) {
              mediaFileLocationRepository.save(MediaFileLocation.builder()
                  .karaokeTrackId(karaokeTrackId.toHexString())
                  .uri(path)
                  .mediaType(mediaType)
                  .build());
            }
          }
        } else {
          List<String> pairs = tryToExtractTitleAndArtist(prefix);
          if (pairs.size() == 2) {
            List<KaraokeTrack> tracks = karaokeTrackRepository.getKaraokeTrackByFileNamePrefix(prefix);
            KaraokeTrack track = tracks.size() > 0 ? tracks.getFirst() : null;
            if (track != null) {
              karaokeTrackId = new ObjectId(track.get_id());
            } else {
              karaokeTrackId = new ObjectId(karaokeTrackRepository.save(KaraokeTrack.builder()
                  .fileNamePrefix(prefix)
                  .title(pairs.get(1))
                  .artist(pairs.get(0))
                  .build()).get_id());
            }
          }

          if (karaokeTrackId != null) {
            if (mediaFileLocationRepository.getMediaFileLocationByUriAndMediaType(path, mediaType) == null) {
              mediaFileLocationRepository.save(MediaFileLocation.builder()
                  .karaokeTrackId(karaokeTrackId.toHexString())
                  .uri(path)
                  .mediaType(mediaType)
                  .build());
            }
          }
        }
      }, dir -> {
        String path = dir.getAbsolutePath();
        path = path.substring(basePathToAssets.length());
        if (path.startsWith("/")) {
          path = path.substring(1);
        }
        if (directoryEntryRepository.getByDirUrl(path) != null) {
          return false;
        }
        directoryEntryRepository.save(DirectoryEntry.builder().dirUrl(path).build());
        return true;
      });
    }

    return "Started Scanning...";
  }



}
