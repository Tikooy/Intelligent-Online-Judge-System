package com.intelligentgrading.service.impl;

import com.intelligentgrading.dto.AdminDashboardVO;
import com.intelligentgrading.mapper.DashboardMapper;
import com.intelligentgrading.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final DashboardMapper dashboardMapper;

    @Override
    public AdminDashboardVO getDashboard() {
        AdminDashboardVO vo = new AdminDashboardVO();

        // 1. 平台运营概览
        vo.setTotalUsers(dashboardMapper.countUsers());
        vo.setTotalSubmissions(dashboardMapper.countSubmissions());
        vo.setTotalProblems(dashboardMapper.countProblems());
        vo.setTotalTestCases(dashboardMapper.countTestCases());
        vo.setOverallAcceptRate(dashboardMapper.overallAcceptRate());
        vo.setPendingSubmissions(dashboardMapper.countPending());
        vo.setSystemErrors(dashboardMapper.countSystemErrors());

        // 2. 题库质量
        vo.setDifficultyDist(toMap(dashboardMapper.difficultyDist()));
        vo.setHottestProblems(toRankItems(dashboardMapper.hottestProblems()));
        vo.setWeakestProblems(toRankItems(dashboardMapper.weakestProblems()));
        vo.setMissingReferenceCode(dashboardMapper.countMissingReferenceCode());
        vo.setMissingTestCases(dashboardMapper.countMissingTestCases());

        // 3. 判题健康度
        vo.setLanguageDist(toMap(dashboardMapper.languageDist()));
        vo.setStatusDist(toMap(dashboardMapper.statusDist()));
        vo.setAvgJudgeTimeMs(dashboardMapper.avgJudgeTimeMs());

        // 4. 最近新增题目
        vo.setRecentProblems(dashboardMapper.recentProblems());

        return vo;
    }

    private Map<String, Long> toMap(List<Map<String, Object>> rows) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            map.put(String.valueOf(row.get("name")), ((Number) row.get("cnt")).longValue());
        }
        return map;
    }

    private List<AdminDashboardVO.ProblemRankItem> toRankItems(List<Map<String, Object>> rows) {
        List<AdminDashboardVO.ProblemRankItem> list = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            AdminDashboardVO.ProblemRankItem item = new AdminDashboardVO.ProblemRankItem();
            item.setId(((Number) row.get("id")).longValue());
            item.setTitle(String.valueOf(row.get("title")));
            item.setDifficulty(String.valueOf(row.get("difficulty")));
            long total = ((Number) row.get("totalSubmissions")).longValue();
            long accepted = ((Number) row.get("acceptedCount")).longValue();
            item.setTotalSubmissions(total);
            item.setAcceptedCount(accepted);
            item.setAcceptRate(total > 0 ? Math.round(accepted * 1000.0 / total) / 10.0 : 0.0);
            list.add(item);
        }
        return list;
    }
}
