package com.watanabe.karaokeserver.data.karaoke;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Search {
  private String searchString;
  private String type;
}
