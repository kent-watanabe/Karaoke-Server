package com.watanabe.karaokeserver.data.karaoke;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class DirectoryEntry implements BaseEntity {
    @Field(targetType = FieldType.OBJECT_ID)
    private String _id;
    private int version;
    private String dirUrl;
}
