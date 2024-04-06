package com.watanabe.karaokeserver.util;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TagData {
  public String artist;
  public String album;
  public String title;
  public int year;
  public String genre;
  public int track;
  public String url;
}
