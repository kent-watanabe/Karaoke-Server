package com.watanabe.karaokeserver.data.auth;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.With;
import lombok.extern.jackson.Jacksonized;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.userdetails.UserDetails;

@Builder
@Data
@With
@Jacksonized
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
public class KaraokeUser implements UserDetails {

  @Id
  private ObjectId _id;
  private String name;
  private String email;
  private String username;
  private List<KaraokeGrantedAuthority> authorities;
  private String password;
  private boolean accountNonExpired;
  private boolean accountNonLocked;
  private boolean credentialsNonExpired;
  private boolean enabled;
}
