package com.watanabe.karaokeserver;

import static org.springframework.boot.SpringApplication.run;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KaraokeServer {

	public static void main(String[] args) {

		SpringApplication.run(KaraokeServer.class,args);
	}

}
