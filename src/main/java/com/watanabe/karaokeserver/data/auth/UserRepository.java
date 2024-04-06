package com.watanabe.karaokeserver.data.auth;

import com.mongodb.client.model.Filters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component()
public class UserRepository {

  @Autowired
  @Qualifier("authMongoTemplate")
  private MongoTemplate authMongoTemplate;

  public User save(User user) {
    return authMongoTemplate.save(user);
  }

  public void delete(User user) {
    authMongoTemplate.remove(user);
  }

  public UserDetails findByUsernameAndPassword(String username, String password) {
    Document doc = authMongoTemplate.getMongoDatabaseFactory().getMongoDatabase()
        .getCollection("user",
            Document.class).find(Filters.and(
            Filters.eq("username", username),
            Filters.eq("password", password)))
        .first();
    if (doc == null) {
      return null;
    }

    return createUserFromDoc(doc);
  }

  public List<? extends UserDetails> findAll() {
    List<UserDetails> users = new ArrayList<>();
    authMongoTemplate.getMongoDatabaseFactory().getMongoDatabase().getCollection("user",
        Document.class).find().forEach(userDoc -> users.add(createUserFromDoc(userDoc)));
    return users;
  }

  private UserDetails createUserFromDoc(Document doc) {
    return User.withUsername(doc.getString("username"))
        .password(doc.getString("username"))
        .accountExpired(!doc.getBoolean("accountNonExpired"))
        .accountLocked(!doc.getBoolean("accountNonLocked"))
        .credentialsExpired(!doc.getBoolean("credentialsNonExpired"))
        .disabled(!doc.getBoolean("enabled"))
        .roles(doc.getList("authorities", String.class).toArray(new String[0]))
        .build();
  }


}
