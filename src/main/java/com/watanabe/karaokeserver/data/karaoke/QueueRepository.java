package com.watanabe.karaokeserver.data.karaoke;

import java.util.Optional;
import org.bson.types.ObjectId;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.RepositoryDefinition;

@RepositoryDefinition(domainClass = QueueRepository.class, idClass = ObjectId.class)
public interface QueueRepository extends CrudRepository<Queue,ObjectId> {
  Optional<Queue> findByName(String name);
}
