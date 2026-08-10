package com.intelligentgrading.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserStatsVO {

    private Long userId;
    private String username;
    private String nickname;
    private String role;
    private Long totalSubmissions;
    private Long acceptedCount;
    private Double acceptRate;
    private Integer rank;               // 排名
    private List<RecentSubmission> recentSubmissions;

    @Data
    public static class RecentSubmission {
        private Long id;
        private Long problemId;
        private String problemTitle;
        private String status;
        private String createdAt;
    }
}
