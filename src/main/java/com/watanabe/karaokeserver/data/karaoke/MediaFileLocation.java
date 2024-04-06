package com.watanabe.karaokeserver.data.karaoke;

import com.watanabe.karaokeserver.data.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

@Data
@Builder
@AllArgsConstructor
@Jacksonized
public class MediaFileLocation implements BaseEntity {
    @Field(targetType = FieldType.OBJECT_ID)
    private String _id;
    private String karaokeTrackId;
    private String uri;
    private MediaType mediaType;
    private int version;

}
