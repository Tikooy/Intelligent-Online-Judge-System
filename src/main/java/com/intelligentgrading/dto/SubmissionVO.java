package com.intelligentgrading.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SubmissionVO {

    private Long id;
    private Long userId;
    private Long problemId;
    private String problemTitle;
    private String language;
    private String status;
    private Integer totalTimeMs;
    private Integer totalMemoryKb;
    private String compileError;
    private LocalDateTime createdAt;

    // 判题详情（仅 GET /api/submissions/{id} 返回）
    private List<SubmissionDetailVO> details;

    @Data
    public static class SubmissionDetailVO {
        private Integer testCaseIndex;
        private String status;
        private Integer timeMs;
        private Integer memoryKb;
        private String actualOutput;
        private String errorMsg;
    }
}
