package com.watanabe.karaokeserver.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {

  public static ObjectMapper getObjectMapper() {
    return new ObjectMapper();
  }

  public static String toJson(Object object) {
    try {
      return getObjectMapper().writeValueAsString(object);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public static JsonNode fromJson(String jsonData) throws JsonProcessingException {
    return getObjectMapper().readTree(jsonData);
  }

  public static <T> T fromJson(String jsonData, Class<T> clazz) throws JsonProcessingException {
    return getObjectMapper().readValue(jsonData, clazz);
  }
}
