package com.application.AKKAPG;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan("com.application.AKKAPG.entity")
public class AkkaPgApplication {

	public static void main(String[] args) {
		SpringApplication.run(AkkaPgApplication.class, args);
	}

}
