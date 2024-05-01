package com.watanabe.karaokeserver.data.auth;

import org.bson.BsonReader;
import org.bson.BsonWriter;
import org.bson.codecs.Codec;
import org.bson.codecs.DecoderContext;
import org.bson.codecs.EncoderContext;

public class KaraokeGrantedAuthorityCodec implements Codec<KaraokeGrantedAuthority> {

  /**
   * Decodes a BSON value from the given reader into an instance of the type parameter {@code T}.
   *
   * @param reader         the BSON reader
   * @param decoderContext the decoder context
   * @return an instance of the type parameter {@code T}.
   */
  @Override
  public KaraokeGrantedAuthority decode(BsonReader reader, DecoderContext decoderContext) {
    return new KaraokeGrantedAuthority(reader.readString());
  }

  /**
   * Encode an instance of the type parameter {@code T} into a BSON value.
   *
   * @param writer         the BSON writer to encode into
   * @param value          the value to encode
   * @param encoderContext the encoder context
   */
  @Override
  public void encode(BsonWriter writer, KaraokeGrantedAuthority value,
      EncoderContext encoderContext) {
    writer.writeString(value.getAuthority());
  }

  /**
   * Returns the Class instance that this encodes. This is necessary because Java does not reify
   * generic types.
   *
   * @return the Class instance that this encodes.
   */
  @Override
  public Class<KaraokeGrantedAuthority> getEncoderClass() {
    return KaraokeGrantedAuthority.class;
  }
}
