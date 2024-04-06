package com.watanabe.karaokeserver.util;

import java.io.File;
import java.util.List;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.function.Consumer;
import java.util.function.Function;

public class DirectoryCrawler {

  private String baseDir;
  private List<String> extensions;
  private ThreadPoolExecutor executor;
  public DirectoryCrawler(String baseDir, List<String> extensions) {
    this.baseDir = baseDir;
    this.extensions = extensions != null ? extensions : List.of(".mp3", ".mp4",".cdg");
    this.extensions.forEach(e -> {
      if(!e.startsWith(".")) {
        throw new IllegalArgumentException("Extension must start with a dot");
      }
    });
    executor = (ThreadPoolExecutor) java.util.concurrent.Executors.newFixedThreadPool(20);
  }

  public void startCrawling(Consumer<File> fileConsumer, Function<File,Boolean> dirFunction) {
    crawl(new File(baseDir), fileConsumer, dirFunction);
  }

  private void crawl(File dir,Consumer<File>  fileConsumer, Function<File,Boolean> dirFunction) {
    if(dir !=null) {
      System.out.println("Crawling " + dir);
      File[] files = dir.listFiles();
      if(files != null) {
        for(File file : files) {
          if(file.isDirectory()) {
            if(dirFunction.apply(file)) {
              executor.execute(() -> crawl(file, fileConsumer, dirFunction));
            }
          } else {
            String fileName = file.getName();
            if(extensions.contains(fileName.substring(fileName.lastIndexOf('.')))) {
              fileConsumer.accept(file);
            }
          }
        }
      }
    }
  }
}
