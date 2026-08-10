package com.intelligentgrading.mapper;

import com.intelligentgrading.dto.AdminDashboardVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface DashboardMapper {

    @Select("SELECT COUNT(*) FROM user")
    long countUsers();

    @Select("SELECT COUNT(*) FROM submission")
    long countSubmissions();

    @Select("SELECT COUNT(*) FROM problem")
    long countProblems();

    @Select("SELECT COUNT(*) FROM test_case")
    long countTestCases();

    @Select("""
        SELECT COALESCE(SUM(status = 'ACCEPTED') * 100.0 / NULLIF(COUNT(*), 0), 0)
        FROM submission
        """)
    double overallAcceptRate();

    @Select("SELECT COUNT(*) FROM submission WHERE status = 'PENDING'")
    long countPending();

    @Select("SELECT COUNT(*) FROM submission WHERE status = 'SYSTEM_ERROR'")
    long countSystemErrors();

    @Select("""
        SELECT difficulty AS name, COUNT(*) AS cnt
        FROM problem GROUP BY difficulty
        """)
    List<Map<String, Object>> difficultyDist();

    @Select("""
        SELECT p.id AS id, p.title AS title, p.difficulty AS difficulty,
               COUNT(s.id) AS totalSubmissions,
               COALESCE(SUM(s.status = 'ACCEPTED'), 0) AS acceptedCount
        FROM problem p
        LEFT JOIN submission s ON p.id = s.problem_id
        GROUP BY p.id
        ORDER BY COUNT(s.id) DESC
        LIMIT 5
        """)
    List<Map<String, Object>> hottestProblems();

    @Select("""
        SELECT p.id AS id, p.title AS title, p.difficulty AS difficulty,
               COUNT(s.id) AS totalSubmissions,
               COALESCE(SUM(s.status = 'ACCEPTED'), 0) AS acceptedCount
        FROM problem p
        LEFT JOIN submission s ON p.id = s.problem_id
        GROUP BY p.id
        HAVING COUNT(s.id) > 0
        ORDER BY (COALESCE(SUM(s.status = 'ACCEPTED'), 0) * 100.0 / NULLIF(COUNT(s.id), 0)) ASC
        LIMIT 5
        """)
    List<Map<String, Object>> weakestProblems();

    @Select("SELECT COUNT(*) FROM problem WHERE reference_code IS NULL OR reference_code = ''")
    long countMissingReferenceCode();

    @Select("""
        SELECT COUNT(*) FROM problem p
        LEFT JOIN test_case tc ON p.id = tc.problem_id
        WHERE tc.id IS NULL
        """)
    long countMissingTestCases();

    @Select("SELECT language AS name, COUNT(*) AS cnt FROM submission GROUP BY language")
    List<Map<String, Object>> languageDist();

    @Select("SELECT status AS name, COUNT(*) AS cnt FROM submission GROUP BY status")
    List<Map<String, Object>> statusDist();

    @Select("SELECT COALESCE(AVG(total_time_ms), 0) FROM submission WHERE total_time_ms > 0")
    double avgJudgeTimeMs();

    @Select("""
        SELECT id, title, difficulty, created_at AS createdAt
        FROM problem ORDER BY created_at DESC LIMIT 5
        """)
    List<AdminDashboardVO.ProblemBrief> recentProblems();
}
