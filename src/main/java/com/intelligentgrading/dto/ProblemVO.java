package com.intelligentgrading.dto;

import lombok.Data;

@Data
public class ProblemVO {

    private Long id;
    private String title;
    private String difficulty;
    private Long totalSubmissions;   // 总提交数
    private Long acceptedCount;      // 通过数
}
