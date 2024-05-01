package com.watanabe.karaokeserver.data.auth;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;
import java.util.List;

public class KaraokeGrantedAuthoritiesCustomSerializer extends JsonSerializer<List<KaraokeGrantedAuthority>>
{

  @Override
  public void serialize(List<KaraokeGrantedAuthority> karaokeGrantedAuthorities,
      JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
    jsonGenerator.writeStartArray();
    for (KaraokeGrantedAuthority grantedAuthority : karaokeGrantedAuthorities) {
      jsonGenerator.writeString(grantedAuthority.getAuthority());
    }
    jsonGenerator.writeEndArray();
  }
}
