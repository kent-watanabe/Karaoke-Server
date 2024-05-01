package com.watanabe.karaokeserver.data.auth;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.RepositoryDefinition;

@RepositoryDefinition(domainClass = KaraokeUser.class, idClass = ObjectId.class)
public interface KaraokeUserRepository extends MongoRepository<KaraokeUser,ObjectId>, KaraokeUserRepositoryCustom {
  KaraokeUser findByUsername(String username);
}
