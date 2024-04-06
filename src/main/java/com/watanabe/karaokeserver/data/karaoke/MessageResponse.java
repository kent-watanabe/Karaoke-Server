package com.watanabe.karaokeserver.data.karaoke;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class MessageResponse {
    private String messageType;
    private String dataMimeType;
    private Object data;
    private String error;
    private String status;
    private String correlationId;
    private String queueId;
}
