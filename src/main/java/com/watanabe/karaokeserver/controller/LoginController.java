package com.watanabe.karaokeserver.controller;

import com.watanabe.karaokeserver.data.auth.KaraokeUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.net.http.HttpResponse;
import java.util.List;
import org.bson.Document;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

  @GetMapping("/login")
  public String login() {
    return "login.html";
  }

  @GetMapping("/logout")
  public String logout(HttpServletRequest request, HttpServletResponse response) {
    request.getSession().invalidate();
    response.addCookie(new Cookie("JSESSIONID", null));
    return "logout.html";
  }

  @GetMapping("/logout.done")
  public String reloadHome() {
    return "/index.html";
  }

  @GetMapping("/whoami")
  public ResponseEntity<String> whoAmi(HttpSession session) {
    Document node = new Document();
    KaraokeUser user = ((KaraokeUser)((SecurityContext)session.getAttribute("SPRING_SECURITY_CONTEXT"))
        .getAuthentication().getPrincipal());
    node.put("username", user.getUsername());
    node.put("name", user.getName());
    return ResponseEntity.status(HttpStatus.OK).body(node.toJson());
  }
}
