package com.watanabe.karaokeserver.controller;

import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthority;
import com.watanabe.karaokeserver.data.auth.KaraokeUser;
import com.watanabe.karaokeserver.data.auth.KaraokeUserRepository;
import com.watanabe.karaokeserver.util.GeneralUtil;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

  @Autowired
  private KaraokeUserRepository userRepository;

  @PutMapping("api/user")
  public void addUser(@RequestBody KaraokeUser karaokeUser) {
    karaokeUser = karaokeUser
        .withAuthorities(List.of(new KaraokeGrantedAuthority("USER")));
    commonAddUser(karaokeUser);
  }

  @PutMapping("api/admin/user")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public void addAdminUser(@RequestBody KaraokeUser karaokeUser) {
    karaokeUser = karaokeUser
        .withAuthorities(List.of(new KaraokeGrantedAuthority("USER"), new KaraokeGrantedAuthority("ADMIN")));
    commonAddUser(karaokeUser);
  }

  private void commonAddUser(KaraokeUser karaokeUser) {
    if(userRepository.findByUsername(karaokeUser.getUsername()) != null) {
      throw new IllegalArgumentException("Username already exists");
    }
    karaokeUser = karaokeUser
        .withEnabled(true)
        .withCredentialsNonExpired(true)
        .withAccountNonExpired(true)
        .withAccountNonLocked(true)
        .withPassword(GeneralUtil.hashPassword(karaokeUser.getPassword()));
    userRepository.save(karaokeUser);
  }
}
