package com.intelligentgrading.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProblemSaveRequest {

    @NotBlank(message = "题目标题不能为空")
    private String title;

    @NotBlank(message = "题目描述不能为空")
    private String description;

    @NotBlank(message = "难度不能为空")
    private String difficulty;    // EASY / MEDIUM / HARD

    private String inputFormat;
    private String outputFormat;
    private String sampleInput;
    private String sampleOutput;
    private String referenceCode;
}
