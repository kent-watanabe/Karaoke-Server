package com.watanabe.karaokeserver.data.auth;

import org.springframework.security.core.userdetails.UserDetails;

public interface KaraokeUserRepositoryCustom{
  UserDetails findByUsernameAndPassword(String username, String password);
}
