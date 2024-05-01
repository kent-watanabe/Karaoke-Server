package com.watanabe.karaokeserver.controller;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonParser.NumberType;
import com.fasterxml.jackson.core.JsonPointer;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;
import com.fasterxml.jackson.databind.node.JsonNodeType;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.watanabe.karaokeserver.data.auth.KaraokeUser;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import org.bson.Document;
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
  public String logout() {
    return "login.html?logout";
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
