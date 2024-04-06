package com.watanabe.karaokeserver.data.karaoke;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.RepositoryDefinition;

@RepositoryDefinition(domainClass = MediaFileLocation.class, idClass = ObjectId.class)
public interface MediaFileLocationRepository extends CrudRepository<MediaFileLocation,ObjectId> {
  public MediaFileLocation getMediaFileLocationBy_id(String _id);
  public Iterable<MediaFileLocation> getMediaFileLocationByKaraokeTrackId(String karaokeTrackId);

  public MediaFileLocation getMediaFileLocationByUriAndMediaType(String uri, MediaType mediaType);
  public MediaFileLocation getMediaFileLocationByKaraokeTrackIdAndMediaType(String karaokeTrackId, MediaType mediaType);
}
