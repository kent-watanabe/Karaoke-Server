package com.watanabe.karaokeserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@SpringBootTest
class KaraokeServerTests {

	@Configuration
	public static class TestConfiguration {

		@Bean
		public KaraokeServer karaokeServer() {
			return new KaraokeServer();
		}
	}

	@Test
	void contextLoads() {

	}



}
