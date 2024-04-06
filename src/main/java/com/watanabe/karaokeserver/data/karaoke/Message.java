package com.watanabe.karaokeserver.data.karaoke;

import lombok.Data;

@Data
public class Message {
    private MessageType messageType;
    private String dataMimeType;
    private String data;
    private String sessionId;
    private String correlationId;
    private String queueId;
}
