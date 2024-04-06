package com.watanabe.karaokeserver.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.watanabe.karaokeserver.data.karaoke.Message;
import com.watanabe.karaokeserver.data.karaoke.MessageResponse;
import com.watanabe.karaokeserver.data.karaoke.MessageType;
import com.watanabe.karaokeserver.data.karaoke.Queue;
import com.watanabe.karaokeserver.data.karaoke.QueueItem;
import com.watanabe.karaokeserver.data.karaoke.QueueRepository;
import com.watanabe.karaokeserver.util.JsonUtil;
import java.util.Optional;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WebsocketMessageService {

  @Autowired
  private QueueRepository queueRepository;

  public MessageResponse handlePing(Message message) {
    return MessageResponse.builder()
        .messageType(MessageType.PONG.toString())
        .correlationId(message.getCorrelationId()).build();
  }

  public MessageResponse handleQueueRefresh(Message message) {
    MessageResponse.MessageResponseBuilder builder = MessageResponse.builder()
        .messageType(MessageType.QUEUE_REFRESH.toString())
        .queueId(message.getQueueId())
        .correlationId(message.getCorrelationId());

    Optional<Queue> queue = queueRepository.findById(new ObjectId(message.getQueueId()));
    builder.data(JsonUtil.toJson(queue.isPresent()? queue.get() : null));
    builder.dataMimeType("application/json");
    return builder.build();
  }

  public MessageResponse handleQueueDeleted(Message message) {
    return null;
  }

  public MessageResponse handleTrackRemoved(Message message) {
    return null;
  }

  public MessageResponse handleTrackPlayed(Message message) {
    MessageResponse.MessageResponseBuilder builder = MessageResponse.builder()
        .messageType(MessageType.TRACK_PLAYED.toString())
        .queueId(message.getQueueId())
        .correlationId(message.getCorrelationId());

    try {
      QueueItem queueItem = JsonUtil.fromJson(message.getData(), QueueItem.class);
      Optional<Queue> optionalQueue = queueRepository.findById(new ObjectId(message.getQueueId()));
      optionalQueue.ifPresent(queue -> {
        queue.deleteQueueItem(queueItem);
        queueRepository.save(queue);
      });
      builder.data(message.getData());
      builder.dataMimeType("application/json");
      return builder.build();
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  public MessageResponse handlePlayTrack(Message message) {
    MessageResponse.MessageResponseBuilder builder = MessageResponse.builder()
        .messageType(MessageType.PLAY_TRACK.toString())
        .queueId(message.getQueueId())
        .correlationId(message.getCorrelationId());
    builder.data(message.getData());
    builder.dataMimeType("application/json");
    return builder.build();
  }

}
