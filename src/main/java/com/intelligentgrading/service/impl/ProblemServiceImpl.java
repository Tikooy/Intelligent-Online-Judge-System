package com.intelligentgrading.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.intelligentgrading.common.BusinessException;
import com.intelligentgrading.dto.*;
import com.intelligentgrading.entity.Problem;
import com.intelligentgrading.entity.TestCase;
import com.intelligentgrading.mapper.ProblemMapper;
import com.intelligentgrading.mapper.SubmissionMapper;
import com.intelligentgrading.mapper.TestCaseMapper;
import com.intelligentgrading.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemServiceImpl implements ProblemService {

    private final ProblemMapper problemMapper;
    private final TestCaseMapper testCaseMapper;
    private final SubmissionMapper submissionMapper;

    @Override
    public Page<ProblemVO> pageQuery(ProblemPageRequest request) {
        LambdaQueryWrapper<Problem> wrapper = new LambdaQueryWrapper<>();
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            wrapper.like(Problem::getTitle, request.getKeyword());
        }
        if (request.getDifficulty() != null && !request.getDifficulty().isBlank()) {
            wrapper.eq(Problem::getDifficulty, request.getDifficulty().toUpperCase());
        }
        wrapper.orderByAsc(Problem::getId);

        Page<Problem> page = new Page<>(request.getPage(), request.getSize());
        Page<Problem> result = problemMapper.selectPage(page, wrapper);

        // 批量查询提交统计，避免 N+1；空集合时跳过，防止生成非法 SQL `IN ()`
        List<Long> problemIds = result.getRecords().stream()
                .map(Problem::getId)
                .collect(Collectors.toList());
        Map<Long, ProblemStatVO> statMap = problemIds.isEmpty() ? Map.of()
                : submissionMapper.getStatsByProblemIds(problemIds)
                    .stream()
                    .collect(Collectors.toMap(ProblemStatVO::getProblemId, s -> s));

        return (Page<ProblemVO>) result.convert(problem -> {
            ProblemVO vo = new ProblemVO();
            vo.setId(problem.getId());
            vo.setTitle(problem.getTitle());
            vo.setDifficulty(problem.getDifficulty());

            ProblemStatVO stat = statMap.get(problem.getId());
            vo.setTotalSubmissions(stat != null ? stat.getTotalSubmissions() : 0L);
            vo.setAcceptedCount(stat != null ? stat.getAcceptedCount() : 0L);
            return vo;
        });
    }

    @Override
    public ProblemDetailVO getDetail(Long problemId, Long userId) {
        Problem problem = problemMapper.selectById(problemId);
        if (problem == null) {
            throw new BusinessException(404, "题目不存在");
        }

        ProblemDetailVO vo = new ProblemDetailVO();
        vo.setId(problem.getId());
        vo.setTitle(problem.getTitle());
        vo.setDescription(problem.getDescription());
        vo.setDifficulty(problem.getDifficulty());
        vo.setInputFormat(problem.getInputFormat());
        vo.setOutputFormat(problem.getOutputFormat());
        vo.setSampleInput(problem.getSampleInput());
        vo.setSampleOutput(problem.getSampleOutput());
        // 参考代码仅登录用户可见，防止未登录拉取全部官方题解
        vo.setReferenceCode(userId != null ? problem.getReferenceCode() : null);
        vo.setCreatedAt(problem.getCreatedAt());

        // 统计（单条聚合查询，替代两次 COUNT 全表扫）
        ProblemStatVO stat = submissionMapper.getStatsByProblemId(problemId);
        vo.setTotalSubmissions(stat != null ? stat.getTotalSubmissions() : 0L);
        vo.setAcceptedCount(stat != null ? stat.getAcceptedCount() : 0L);

        return vo;
    }

    @Override
    @Transactional
    public Problem create(ProblemSaveRequest request) {
        Problem problem = new Problem();
        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setDifficulty(request.getDifficulty().toUpperCase());
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());
        problem.setSampleInput(request.getSampleInput());
        problem.setSampleOutput(request.getSampleOutput());
        problem.setReferenceCode(request.getReferenceCode());
        problem.setCreatedAt(LocalDateTime.now());

        problemMapper.insert(problem);
        return problem;
    }

    @Override
    @Transactional
    public void update(Long problemId, ProblemSaveRequest request) {
        Problem problem = problemMapper.selectById(problemId);
        if (problem == null) {
            throw new BusinessException(404, "题目不存在");
        }

        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setDifficulty(request.getDifficulty().toUpperCase());
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());
        problem.setSampleInput(request.getSampleInput());
        problem.setSampleOutput(request.getSampleOutput());
        problem.setReferenceCode(request.getReferenceCode());

        problemMapper.updateById(problem);
    }

    @Override
    @Transactional
    public void delete(Long problemId) {
        if (problemMapper.selectById(problemId) == null) {
            throw new BusinessException(404, "题目不存在");
        }
        // 级联删除：test_case 和 submission 在 DB 层有 ON DELETE CASCADE
        problemMapper.deleteById(problemId);
    }

    @Override
    @Transactional
    public void uploadTestCases(Long problemId, TestCaseUploadRequest request) {
        if (problemMapper.selectById(problemId) == null) {
            throw new BusinessException(404, "题目不存在");
        }

        for (TestCaseUploadRequest.TestCaseItem item : request.getTestCases()) {
            TestCase tc = new TestCase();
            tc.setProblemId(problemId);
            tc.setInput(item.getInput());
            tc.setExpectedOutput(item.getExpectedOutput());
            tc.setTimeLimitMs(item.getTimeLimitMs());
            tc.setMemoryLimitKb(item.getMemoryLimitKb());
            tc.setIsSample(item.getIsSample());
            testCaseMapper.insert(tc);
        }
    }
}
