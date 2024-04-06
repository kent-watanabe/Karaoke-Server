package com.watanabe.karaokeserver.controller;

import static org.springframework.http.HttpStatus.OK;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.watanabe.karaokeserver.data.karaoke.MediaFileLocation;
import com.watanabe.karaokeserver.data.karaoke.MediaFileLocationRepository;
import com.watanabe.karaokeserver.data.karaoke.MediaType;
import com.watanabe.karaokeserver.data.karaoke.MessageResponse;
import com.watanabe.karaokeserver.data.karaoke.MessageType;
import com.watanabe.karaokeserver.data.karaoke.Queue;
import com.watanabe.karaokeserver.data.karaoke.QueueItem;
import com.watanabe.karaokeserver.data.karaoke.QueueRepository;
import com.watanabe.karaokeserver.util.JsonUtil;
import jakarta.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Optional;
import javax.imageio.ImageIO;
import net.minidev.json.JSONObject;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/queue")
@PreAuthorize("hasRole('ROLE_USER')")
public class QueueController {

  @Autowired
  private QueueRepository queueRepository;

  @Autowired
  private MediaFileLocationRepository mediaFileLocationRepository;

  @Autowired
  private KafkaTemplate<Object, Object> template;


  @PutMapping(value = "/{queueId}/add", consumes = "application/json")
  @ResponseStatus(code = OK)
  public void addToQueue(@PathVariable("queueId") String queueId, @RequestBody QueueItem queueItem,
      HttpServletResponse response) throws IOException {

    Optional<Queue> optQueue = queueRepository.findById(new ObjectId(queueId));
    if (optQueue.isEmpty()) {
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "Queue not found");
    }
    try {
      new ObjectId(queueItem.getId());
    } catch (Exception e) {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid track id");
    }

    if (queueItem.getId() == null || queueItem.getId().isEmpty()) {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Track id is required");
    }

    if (queueItem.getSinger().isEmpty()) {
      UserDetails details = (UserDetails) SecurityContextHolder.getContext().getAuthentication()
          .getPrincipal();
      queueItem.setSinger(details.getUsername());
    }

    Queue queue = optQueue.get();
    //Get the file type and set into queueItem
    MediaFileLocation mediaFileLocation = mediaFileLocationRepository.getMediaFileLocationByKaraokeTrackId(
        queueItem.getId()).iterator().next();
    if (mediaFileLocation != null) {
      MediaType mediaType = mediaFileLocation.getMediaType();
      if (mediaType == MediaType.CDG || mediaType == MediaType.MP3) {
        queueItem.setType(MediaType.CDG.toString());
      } else if (mediaType == MediaType.MP4) {
        queueItem.setType(MediaType.MP4.toString());
      }
    }
    queue.addQueueItem(queueItem);
    queueRepository.save(queue);

    MessageResponse message = MessageResponse.builder()
        .messageType(MessageType.TRACK_ADDED.toString())
        .dataMimeType("application/json")
        .data(JsonUtil.toJson(queueItem))
        .queueId(queueId)
        .build();

    template.send("karaoke", queueItem.getId(), JsonUtil.toJson(message));
  }

  @PostMapping(value = "/{queueId}/QRCode", produces = "image/jpeg")
  @ResponseStatus(code = OK)
  public void createQueueQRCode(@PathVariable("queueId") String queueId,
      @RequestBody JSONObject queueInfo,
      HttpServletResponse response) throws IOException, WriterException {
    QRCodeWriter barcodeWriter = new QRCodeWriter();
    BitMatrix bitMatrix = null;
    bitMatrix = barcodeWriter.encode(
        queueInfo.getAsString("url") + "?queue=" + queueId,
        BarcodeFormat.QR_CODE, 200, 200);
    BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix);
    OutputStream output = response.getOutputStream();
    ImageIO.write(image, "jpg", output);
    response.flushBuffer();
  }

}
