package com.watanabe.karaokeserver.data.auth;

import org.bson.types.ObjectId;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.RepositoryDefinition;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

@RepositoryDefinition(domainClass = ClientRegistration.class, idClass = ObjectId.class)
public interface KaraokeClientRegistrationRepository extends CrudRepository<ClientRegistration,ObjectId>, ClientRegistrationRepository {

}
