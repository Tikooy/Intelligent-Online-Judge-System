package com.intelligentgrading.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class TestCaseUploadRequest {

    @NotEmpty(message = "测试用例不能为空")
    private List<TestCaseItem> testCases;

    @Data
    public static class TestCaseItem {
        private String input;
        private String expectedOutput;
        private Integer timeLimitMs = 5000;
        private Integer memoryLimitKb = 131072;
        private Boolean isSample = false;
    }
}
