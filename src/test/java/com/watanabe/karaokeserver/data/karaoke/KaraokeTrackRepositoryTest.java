package com.watanabe.karaokeserver.data.karaoke;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.AutoConfigureDataMongo;
import org.springframework.boot.test.context.SpringBootTest;


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureDataMongo
public class KaraokeTrackRepositoryTest {

  @Autowired
  private KaraokeTrackRepository trackRepository;

  @Test
  public void testFindByArtist() {
   List<KaraokeTrack> tracks =trackRepository.getKaraokeTrackByArtist("Foo");
   assertThat(tracks.size()).isGreaterThan(2);
  }

}
