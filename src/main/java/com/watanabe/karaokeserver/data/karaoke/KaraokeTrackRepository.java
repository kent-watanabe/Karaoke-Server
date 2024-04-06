package com.watanabe.karaokeserver.data.karaoke;

import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.RepositoryDefinition;

@RepositoryDefinition(domainClass = KaraokeTrack.class, idClass = ObjectId.class)
public interface KaraokeTrackRepository extends CrudRepository<KaraokeTrack,ObjectId> {
  public List<KaraokeTrack> getKaraokeTrackByFileNamePrefix(String fileNamePrefix);
  public KaraokeTrack getKaraokeTrackBy_id(String _id);

  @Query("{artist:{$regex:'.*?0.*',$options:'i'}}")
  public List<KaraokeTrack> getKaraokeTrackByArtist(String artist);
  @Query("{title:{$regex:'.*?0.*',$options:'i'}}")
  public List<KaraokeTrack> getKaraokeTrackByTitle(String title);
}
