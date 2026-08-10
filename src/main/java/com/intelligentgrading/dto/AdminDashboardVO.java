package com.intelligentgrading.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 管理员仪表盘聚合数据
 */
@Data
public class AdminDashboardVO {

    // ---- 1. 平台运营概览 ----
    private Long totalUsers;
    private Long totalSubmissions;
    private Long totalProblems;
    private Long totalTestCases;
    private Double overallAcceptRate;   // 整体通过率 %
    private Long pendingSubmissions;    // 待判队列
    private Long systemErrors;          // 系统错误数

    // ---- 2. 题库质量 ----
    private Map<String, Long> difficultyDist;      // EASY/MEDIUM/HARD -> 题目数
    private List<ProblemRankItem> hottestProblems; // 最热门 Top5
    private List<ProblemRankItem> weakestProblems; // 最易错 Top5
    private Long missingReferenceCode;             // 无参考代码题目数
    private Long missingTestCases;                 // 无测试用例题目数

    // ---- 3. 判题健康度 ----
    private Map<String, Long> languageDist;        // 各语言提交数
    private Map<String, Long> statusDist;          // 各判题状态数
    private Double avgJudgeTimeMs;                 // 平均判题耗时

    // ---- 4. 最近新增题目 ----
    private List<ProblemBrief> recentProblems;

    @Data
    public static class ProblemRankItem {
        private Long id;
        private String title;
        private String difficulty;
        private Long totalSubmissions;
        private Long acceptedCount;
        private Double acceptRate;                 // 通过率 %
    }

    @Data
    public static class ProblemBrief {
        private Long id;
        private String title;
        private String difficulty;
        private String createdAt;
    }
}
