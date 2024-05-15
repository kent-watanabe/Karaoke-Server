package com.watanabe.karaokeserver.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClients;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthoritiesCodec;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthorityCodec;
import com.watanabe.karaokeserver.data.auth.KaraokeUser;
import org.bson.UuidRepresentation;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
    basePackages = {"com.watanabe.karaokeserver.data.auth"},
    mongoTemplateRef = "authMongoTemplate")
public class AuthMongoConfiguration {

  @Value("${spring.data.mongodb.auth.uri}")
  private String authUri;

  @Bean
  public MongoClientSettings authClientSettings() {
    return MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString(authUri))
        .codecRegistry(CodecRegistries.fromRegistries(
            MongoClientSettings.getDefaultCodecRegistry(),
            CodecRegistries.fromProviders(PojoCodecProvider.builder()
                .automatic(true)
                .register(KaraokeUser.class)
                .conventions(Conventions.DEFAULT_CONVENTIONS)
                .build()),
            CodecRegistries.fromCodecs(
                new KaraokeGrantedAuthoritiesCodec(),
                new KaraokeGrantedAuthorityCodec()
            )))
        .uuidRepresentation(UuidRepresentation.JAVA_LEGACY)
        .build();
  }

  @Primary
  @Bean
  public MongoDatabaseFactory authMongoDBFactory(MongoClientSettings authClientSettings) {
    return new SimpleMongoClientDatabaseFactory(MongoClients.create(authClientSettings), "auth");
  }

  @Primary
  @Bean
  public MongoTemplate authMongoTemplate(@Qualifier("authMongoDBFactory") MongoDatabaseFactory mongoDbFactory) {
    return new MongoTemplate(mongoDbFactory);
  }
}
