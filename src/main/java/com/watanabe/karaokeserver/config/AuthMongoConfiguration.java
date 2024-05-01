package com.watanabe.karaokeserver.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthoritiesCodec;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthority;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthorityCodec;
import com.watanabe.karaokeserver.data.auth.KaraokeUser;
import java.util.Arrays;
import org.bson.UuidRepresentation;
import org.bson.codecs.UuidCodec;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.env.Environment;
import org.springframework.data.convert.CustomConversions;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions.MongoConverterConfigurationAdapter;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
    basePackages = {"com.watanabe.karaokeserver.data.auth"},
    mongoTemplateRef = "authMongoTemplate")
public class AuthMongoConfiguration extends AbstractMongoClientConfiguration {
  @Autowired
  private Environment environment;

  @Override
  public void configureClientSettings(MongoClientSettings.Builder builder)
  {
    builder.applyConnectionString(new ConnectionString(environment.getProperty("spring.data.mongodb.auth.uri")));
    builder.codecRegistry(codecRegistries());
  }

  private CodecRegistry codecRegistries() {
    return CodecRegistries.fromRegistries(
        MongoClientSettings.getDefaultCodecRegistry(),
        CodecRegistries.fromProviders(PojoCodecProvider.builder()
            .automatic(true)
            .register(KaraokeUser.class)
            .conventions(Conventions.DEFAULT_CONVENTIONS)
            .build()),
        CodecRegistries.fromCodecs(
            new UuidCodec(UuidRepresentation.STANDARD),
            new KaraokeGrantedAuthoritiesCodec(),
            new KaraokeGrantedAuthorityCodec()
        ));
  }

  public static class KaraokeGrantedAuthorityConverter implements
      Converter<KaraokeGrantedAuthority, String> {

    @Override
    public String convert(KaraokeGrantedAuthority source) {
      return source.getAuthority();
    }
  }

  @Override
  public void configureConverters(MongoConverterConfigurationAdapter converterConfigurationAdapter){
    converterConfigurationAdapter.registerConverter(new KaraokeGrantedAuthorityConverter());
  }



  @Bean(name = "authDbFactory")
  public MongoDatabaseFactory authDbFactory() {
    return new SimpleMongoClientDatabaseFactory(mongoClient(), getDatabaseName());
  }


  @Bean(name = "authMongoTemplate")
  public MongoTemplate authMongoTemplate(@Qualifier("authDbFactory") MongoDatabaseFactory databaseFactory, MappingMongoConverter converter) {
    return new MongoTemplate(databaseFactory, converter);
  }

  @Override
  protected String getDatabaseName() {
    return "auth";
  }
}
