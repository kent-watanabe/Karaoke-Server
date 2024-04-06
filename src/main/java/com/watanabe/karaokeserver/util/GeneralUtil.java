package com.watanabe.karaokeserver.util;

import java.net.URI;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

public class GeneralUtil
{
  public static String hashPassword(String password) {
    try {
      java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
      return bytesToHex(hash);
    } catch (java.security.NoSuchAlgorithmException e) {
      e.printStackTrace();
    }
    return null;
  }

  public static String bytesToHex(byte[] hash) {
    StringBuilder hexString = new StringBuilder(2 * hash.length);
    for (int i = 0; i < hash.length; i++) {
      String hex = Integer.toHexString(0xff & hash[i]);
      if(hex.length() == 1) {
        hexString.append('0');
      }
      hexString.append(hex);
    }
    return hexString.toString();
  }

  public static Map<String, String> parseUri(String uriString) {
    try {
      Map<String, String> queryPairs = new HashMap<>();
      URI uri = new URI(uriString);
      String query = uri.getQuery();
      if (query != null) {
        String[] pairs = query.split("&");
        for (String pair : pairs) {
          int idx = pair.indexOf("=");
          String key = URLDecoder.decode(pair.substring(0, idx), "UTF-8");
          String value = URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
          queryPairs.put(key, value);
        }
      }
      return queryPairs;
    } catch (Exception e) {
      throw new RuntimeException("Failed to parse URI", e);
    }
  }
}
