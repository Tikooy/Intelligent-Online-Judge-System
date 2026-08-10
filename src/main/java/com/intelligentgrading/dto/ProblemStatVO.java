package com.intelligentgrading.dto;

import lombok.Data;

@Data
public class ProblemStatVO {
    private Long problemId;
    private Long totalSubmissions;
    private Long acceptedCount;
}
