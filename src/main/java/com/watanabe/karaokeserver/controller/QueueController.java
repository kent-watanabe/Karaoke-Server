package com.watanabe.karaokeserver.controller;

import static org.springframework.http.HttpStatus.OK;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.apache.kafka.common.protocol.types.Field.Str;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/queue")
public class QueueController {

  private static final String QRURIFormat = "%s://%s:%d/mobilequeue.html?queueId=%s";

  @Autowired
  private QueueRepository queueRepository;

  @Autowired
  private MediaFileLocationRepository mediaFileLocationRepository;

  @Autowired
  private KafkaTemplate<Object, Object> template;

  @PutMapping(value = "/{queueId}/add", consumes = "application/json")
  @ResponseStatus(code = OK)
  @PreAuthorize("hasRole('ROLE_USER')")
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

    //Let's give the queueItem a unique id relative to queue
    queueItem.setInternalQueueItemId(UUID.randomUUID());
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

  @GetMapping(value = "/{queueId}/QRCode", produces = "image/jpeg")
  @ResponseStatus(code = OK)
  @PreAuthorize("hasRole('ROLE_USER')")
  public void createQueueQRCode(@PathVariable("queueId") String queueId,
      HttpServletRequest request, HttpServletResponse response)
      throws IOException, WriterException, URISyntaxException {
    QRCodeWriter barcodeWriter = new QRCodeWriter();
    BitMatrix bitMatrix = null;
    URI uri = new URI(request.getRequestURL().toString());
    URI linkURI = null;
    if (uri.getHost().equals("localhost")) {
      String computerName =
          System.getenv().get("COMPUTERNAME") != null ? System.getenv().get("COMPUTERNAME")
              : System.getenv().get("HOSTNAME");
      if (computerName == null) {
        NetworkInterface networkInterface = NetworkInterface.getByInetAddress(
            InetAddress.getLocalHost());
        Enumeration<InetAddress> e = networkInterface.getInetAddresses();
        while (e.hasMoreElements()) {
          InetAddress inetAddress = e.nextElement();
          if (!inetAddress.isLoopbackAddress() || inetAddress.isSiteLocalAddress()) {
            linkURI = new URI(
                String.format(QRURIFormat, uri.getScheme(), inetAddress.getHostAddress(),
                    uri.getPort(), queueId));
            break;
          }
        }
      } else {
        linkURI = new URI(
            String.format(QRURIFormat, uri.getScheme(), computerName + ".local", uri.getPort(),
                queueId));
      }
    } else {
      linkURI = new URI(
          String.format(QRURIFormat, uri.getScheme(), uri.getHost(), uri.getPort(), queueId));
    }
    if (linkURI == null) {
      throw new URISyntaxException("", "Invalid URI");
    }

    bitMatrix = barcodeWriter.encode(
        linkURI.toString(),
        BarcodeFormat.QR_CODE, 200, 200);

    BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix);
    OutputStream output = response.getOutputStream();
    ImageIO.write(image, "jpg", output);
    response.flushBuffer();
  }

  @PutMapping("/")
  @ResponseStatus(code = OK)
  @PreAuthorize("hasRole('ROLE_USER')")
  public ResponseEntity<JsonNode> createQueue(HttpServletRequest request,
      @RequestBody JsonNode queueInfo) throws IOException {
    if (queueInfo.get("name") == null || queueInfo.get("name").asText().isEmpty()) {
      ObjectNode errorNode = JsonUtil.getObjectMapper().createObjectNode();
      errorNode.put("error", "Queue name is required");
      return ResponseEntity.badRequest().body(errorNode);
    }

    queueRepository.findByName(queueInfo.get("name").asText()).ifPresent(queue -> {
      ObjectNode errorNode = JsonUtil.getObjectMapper().createObjectNode();
      errorNode.put("error", "Queue name already exists");
      ResponseEntity.badRequest().body(errorNode);
    });

    Queue queue = Queue.builder()
        .name(queueInfo.get("name").asText())
        .description(
            queueInfo.get("description") != null ? queueInfo.get("description").asText() : "")
        .ownerId(request.getUserPrincipal().getName())
        .queueItems(new ArrayList<>())
        .build();
    queue = queueRepository.save(queue);
    ObjectNode returnNode = queueInfo.deepCopy();
    returnNode.put("id", queue.get_id());
    return ResponseEntity.ok(returnNode);
  }

  @GetMapping("/")
  @ResponseStatus(code = OK)
  @PreAuthorize("hasRole('ROLE_USER')")
  public ResponseEntity<JsonNode> getQueues() {
    List<Queue> queues = queueRepository.findByOwnerId(SecurityContextHolder.getContext().getAuthentication().getName());
    ArrayNode returnNode = JsonUtil.getObjectMapper().createArrayNode();
    queues.forEach(queue -> {
      ObjectNode queueNode = JsonUtil.getObjectMapper().convertValue(queue, ObjectNode.class);
      returnNode.add(queueNode);
    });
    return ResponseEntity.ok(returnNode);
  }

  @DeleteMapping("/{queueId}")
  @ResponseStatus(code = OK)
  @PreAuthorize("hasRole('ROLE_USER')")
  public void deleteQueues(@PathVariable("queueId") String queueId) {
    queueRepository.deleteById(new ObjectId(queueId));
  }

}
