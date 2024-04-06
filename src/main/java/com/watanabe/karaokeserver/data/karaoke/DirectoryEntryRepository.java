package com.watanabe.karaokeserver.data.karaoke;

import org.bson.types.ObjectId;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.RepositoryDefinition;

@RepositoryDefinition(domainClass = DirectoryEntry.class, idClass = ObjectId.class)
public interface DirectoryEntryRepository extends CrudRepository<DirectoryEntry,ObjectId> {
  public DirectoryEntry getByDirUrl(String dirUrl);
}
