package com.watanabe.karaokeserver.util;

import com.mpatric.mp3agic.ID3v1;
import com.mpatric.mp3agic.ID3v2;
import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.UnsupportedTagException;
import java.io.File;
import java.io.IOException;
import java.util.Optional;

public class TagParser {
  public static Optional<TagData> parseTag(File file) throws InvalidDataException, UnsupportedTagException, IOException {
    Mp3File mp3File = new Mp3File(file);

    if(mp3File.hasId3v2Tag())
    {
      ID3v2 v2Tag = mp3File.getId3v2Tag();
      return Optional.of(getTagData(file, v2Tag));
    }
    else if(mp3File.hasId3v1Tag())
    {
      ID3v1 v1Tag = mp3File.getId3v1Tag();
      return Optional.of(getTagData(file, v1Tag));
    }
    return Optional.empty();
  }

  private static TagData getTagData(File file, ID3v1 v1Tag) {
    TagData.TagDataBuilder builder =  TagData.builder();
    String absolutePath = separatorsToUnix(file.getPath().substring(2, file.getPath().length()));
    builder.album(v1Tag.getAlbum())
        .artist(v1Tag.getArtist())
        .genre(v1Tag.getGenreDescription())
        .title(v1Tag.getTitle())
        .url(absolutePath);
    if(v1Tag.getTrack() != null && !v1Tag.getTrack().isEmpty()) {
      builder.track(Integer.parseInt(v1Tag.getTrack()));
    }
    if(v1Tag.getYear() != null && !v1Tag.getYear().isEmpty()) {
      builder.year(Integer.parseInt(v1Tag.getYear()));
    }
    return builder.build();
  }

  private static String separatorsToUnix(String res) {
    if (res==null) return null;
    if (File.separatorChar=='\\') {
      // From Windows to Linux/Mac
      return res.replace(File.separatorChar, '/');
    }
    return res;
  }
}
