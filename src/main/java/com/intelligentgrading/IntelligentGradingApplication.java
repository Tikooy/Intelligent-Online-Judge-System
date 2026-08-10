package com.intelligentgrading;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.intelligentgrading.mapper")
public class IntelligentGradingApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntelligentGradingApplication.class, args);
    }
}
