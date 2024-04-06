package com.watanabe.karaokeserver.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
    basePackages = {"com.watanabe.karaokeserver.data.auth"},
    mongoTemplateRef = "authMongoTemplate")
public class AuthMongoConfiguration {

  @Autowired
  private ApplicationContext context;

  @Autowired
  private Environment environment;

  @Bean
  public MongoProperties authMongoProperties() {
    MongoProperties properties =  new MongoProperties();
    properties.setUri(environment.getProperty("spring.data.mongodb.auth.uri"));
    return properties;
  }

  @Bean
  public MongoTemplate authMongoTemplate() {
    return new MongoTemplate(authDbFactory((MongoProperties)context.getBean("authMongoProperties")));
  }

  @Bean
  public MongoDatabaseFactory authDbFactory(
      final @Qualifier("authMongoProperties") MongoProperties mongo) {
    return new SimpleMongoClientDatabaseFactory(mongo.getUri());
  }
}
