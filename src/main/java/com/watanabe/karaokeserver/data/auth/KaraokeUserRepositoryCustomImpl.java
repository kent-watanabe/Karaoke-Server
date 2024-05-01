package com.watanabe.karaokeserver.data.auth;

import com.mongodb.client.model.Filters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class KaraokeUserRepositoryCustomImpl implements KaraokeUserRepositoryCustom {

  @Autowired
  @Qualifier("authMongoTemplate")
  private MongoTemplate authMongoTemplate;

  public UserDetails findByUsernameAndPassword(String username, String password) {
    return authMongoTemplate.getMongoDatabaseFactory().getMongoDatabase()
        .getCollection("user", KaraokeUser.class).find(Filters.and(
            Filters.eq("username", username),
            Filters.eq("password", password)))
        .first();
  }
}
