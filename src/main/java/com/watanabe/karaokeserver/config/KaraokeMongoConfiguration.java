package com.watanabe.karaokeserver.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClients;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthoritiesCodec;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthority;
import com.watanabe.karaokeserver.data.auth.KaraokeGrantedAuthorityCodec;
import com.watanabe.karaokeserver.data.auth.KaraokeUser;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.Objects;
import org.bson.UuidRepresentation;
import org.bson.codecs.UuidCodec;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.CodecRegistryProvider;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions.MongoConverterConfigurationAdapter;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
    basePackages = {"com.watanabe.karaokeserver.data.karaoke"},
    mongoTemplateRef = "karaokeMongoTemplate")
public class KaraokeMongoConfiguration {

  @Value("${spring.data.mongodb.karaoke.uri}")
  private String karaokeUri;

  @Bean
  public MongoClientSettings karaokeClientSettings() {
    return MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString(karaokeUri))
        .uuidRepresentation(UuidRepresentation.JAVA_LEGACY)
        .build();
  }

  @Bean
  public MongoDatabaseFactory karaokeMongoDBFactory(MongoClientSettings authClientSettings) {
    return new SimpleMongoClientDatabaseFactory(MongoClients.create(authClientSettings), "karaoke");
  }

  @Bean
  public MongoTemplate karaokeMongoTemplate(@Qualifier("karaokeMongoDBFactory") MongoDatabaseFactory mongoDbFactory) {
    return new MongoTemplate(mongoDbFactory);
  }
}
