package com.watanabe.karaokeserver.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.watanabe.karaokeserver.data.karaoke.Message;
import com.watanabe.karaokeserver.data.karaoke.MessageResponse;
import com.watanabe.karaokeserver.service.WebsocketMessageService;
import com.watanabe.karaokeserver.util.GeneralUtil;
import com.watanabe.karaokeserver.util.JsonUtil;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Service
public class KaraokeHandler extends TextWebSocketHandler {

  public static final Logger log = LoggerFactory.getLogger(KaraokeHandler.class);
  private static Map<String, Map<String,WebSocketSession>> queuePeers;

  @Autowired
  private KafkaTemplate<Object, Object> template;

  private WebsocketMessageService websocketMessageService;

  public KaraokeHandler(WebsocketMessageService websocketMessageService) {
    this.websocketMessageService = websocketMessageService;
    queuePeers = Collections.synchronizedMap(new HashMap<>());
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) {
    Map<String, String> params = GeneralUtil.parseUri(session.getUri().toString());
    if (params.containsKey("queueId")) {
      String queueId = params.get("queueId");
      if (!queuePeers.containsKey(queueId)) {
        queuePeers.put(queueId, Collections.synchronizedMap(new HashMap<String, WebSocketSession>()));
      }
      queuePeers.get(queueId).put(session.getId(), session);
    }
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    queuePeers.forEach((queueId, peers) -> {
      peers.remove(session.getId());
    });
  }

  @KafkaListener(topics = "karaoke", groupId = "${spring.kafka.consumer.group-id}")
  public void listen(String message) {
    log.info("Received kafka message: {}", message);
    try {
      MessageResponse response = JsonUtil.fromJson(message, MessageResponse.class);
      queuePeers.get(response.getQueueId()).forEach((id, peer) -> {
        try {
          peer.sendMessage(new TextMessage(message));
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      });
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  private void sendDirectMessage(MessageResponse response, WebSocketSession session)
      throws RuntimeException {
    try {
      session.sendMessage(new TextMessage(JsonUtil.toJson(response)));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private void sendBroadcastMessage(MessageResponse response) {
    queuePeers.get(response.getQueueId()).forEach((id, peer) -> {
      try {
        peer.sendMessage(new TextMessage(JsonUtil.toJson(response)));
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    });
  }

  @Override
  public void handleTextMessage(WebSocketSession session, TextMessage message) {
    try {
      Message incomingMessage = JsonUtil.fromJson(message.getPayload(), Message.class);
      MessageResponse response = null;
      switch (incomingMessage.getMessageType()) {
        case PING:
          response = websocketMessageService.handlePing(incomingMessage);
          sendDirectMessage(response, session);
          break;
        case QUEUE_REFRESH:
          response = websocketMessageService.handleQueueRefresh(incomingMessage);
          sendDirectMessage(response, session);
          break;
        case TRACK_PLAYED:
          response = websocketMessageService.handleTrackPlayed(incomingMessage);
          template.send("karaoke", response.getQueueId(), JsonUtil.toJson(response));
          break;
        case PLAY_TRACK:
          response = websocketMessageService.handlePlayTrack(incomingMessage);
          sendBroadcastMessage(response);
          break;
        default:
          log.warn("Unknown message type: {}", incomingMessage.getMessageType());
      }
    } catch (IOException e) {
      log.error("Error parsing message", e);
    }
  }
}

