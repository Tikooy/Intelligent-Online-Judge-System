package com.intelligentgrading.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProblemDetailVO {

    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private String inputFormat;
    private String outputFormat;
    private String sampleInput;
    private String sampleOutput;
    private Long totalSubmissions;
    private Long acceptedCount;
    private String referenceCode;
    private LocalDateTime createdAt;
}
