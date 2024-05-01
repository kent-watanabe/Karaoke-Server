package com.watanabe.karaokeserver.data.auth;

import java.util.List;
import org.bson.BsonReader;
import org.bson.BsonWriter;
import org.bson.codecs.Codec;
import org.bson.codecs.DecoderContext;
import org.bson.codecs.EncoderContext;

public class KaraokeGrantedAuthoritiesCodec implements Codec<List<KaraokeGrantedAuthority>> {

  /**
   * Decodes a BSON value from the given reader into an instance of the type parameter {@code T}.
   *
   * @param reader         the BSON reader
   * @param decoderContext the decoder context
   * @return an instance of the type parameter {@code T}.
   */
  @Override
  public List<KaraokeGrantedAuthority> decode(BsonReader reader,
      DecoderContext decoderContext) {
    reader.readStartArray();
    List<KaraokeGrantedAuthority> authorities = new java.util.ArrayList<>();
    while (reader.readBsonType() != org.bson.BsonType.END_OF_DOCUMENT) {
      authorities.add(new KaraokeGrantedAuthority(reader.readString()));
    }
    reader.readEndArray();
    return authorities;
  }

  /**
   * Encode an instance of the type parameter {@code T} into a BSON value.
   *
   * @param writer         the BSON writer to encode into
   * @param value          the value to encode
   * @param encoderContext the encoder context
   */
  @Override
  public void encode(BsonWriter writer, List<KaraokeGrantedAuthority> value,
      EncoderContext encoderContext) {
    writer.writeStartArray();
    for (KaraokeGrantedAuthority grantedAuthority : value) {
      writer.writeString(grantedAuthority.getAuthority());
    }
    writer.writeEndArray();
  }

  /**
   * Returns the Class instance that this encodes. This is necessary because Java does not reify
   * generic types.
   *
   * @return the Class instance that this encodes.
   */
  @Override
  public Class<List<KaraokeGrantedAuthority>> getEncoderClass() {
    return (Class<List<KaraokeGrantedAuthority>>) (Class<?>) List.class;
  }
}
