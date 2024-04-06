package com.watanabe.karaokeserver.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
    basePackages = {"com.watanabe.karaokeserver.data.karaoke"},
    mongoTemplateRef = "karaokeMongoTemplate")
public class KaraokeMongoConfiguration {

  @Autowired
  private ApplicationContext context;

  @Autowired
  private Environment environment;

  @Bean
  @Primary
  public MongoProperties karaokeMongoProperties() {
    MongoProperties properties =  new MongoProperties();
    properties.setUri(environment.getProperty("spring.data.mongodb.karaoke.uri"));
    return properties;
  }

  @Bean
  @Primary
  public MongoTemplate karaokeMongoTemplate() {
    return new MongoTemplate(karaokeDbFactory((MongoProperties)context.getBean("karaokeMongoProperties")));
  }

  @Bean
  @Primary
  public MongoDatabaseFactory karaokeDbFactory(
      final @Qualifier("karaokeMongoProperties") MongoProperties mongo) {
    return new SimpleMongoClientDatabaseFactory(mongo.getUri());
  }

}
