package com.watanabe.karaokeserver.data.karaoke;

import com.watanabe.karaokeserver.data.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

@Data
@AllArgsConstructor
@Builder
@Jacksonized
public class Queue implements BaseEntity {
    @Field(targetType = FieldType.OBJECT_ID)
    private String _id;
    protected String name;
    protected String description;
    protected String ownerId;
    private List<QueueItem> queueItems;
    private int version;

    public void addQueueItem(QueueItem item) {
        if(queueItems == null) {
            queueItems = List.of(item);
            return;
        }
        this.queueItems.add(item);
    }

    public void deleteQueueItem(QueueItem item) {
        this.queueItems.remove(item);
    }
}
