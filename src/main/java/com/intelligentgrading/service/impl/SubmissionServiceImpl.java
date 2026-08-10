package com.intelligentgrading.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intelligentgrading.common.BusinessException;
import com.intelligentgrading.dto.SubmitRequest;
import com.intelligentgrading.dto.SubmitResponse;
import com.intelligentgrading.dto.SubmissionVO;
import com.intelligentgrading.entity.Problem;
import com.intelligentgrading.entity.Submission;
import com.intelligentgrading.entity.SubmissionDetail;
import com.intelligentgrading.entity.TestCase;
import com.intelligentgrading.mapper.ProblemMapper;
import com.intelligentgrading.mapper.SubmissionDetailMapper;
import com.intelligentgrading.mapper.SubmissionMapper;
import com.intelligentgrading.mapper.TestCaseMapper;
import com.intelligentgrading.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private static final String QUEUE_KEY = "queue:submissions";
    private static final String WS_TOKEN_PREFIX = "ws:token:";
    private static final String RATE_LIMIT_PREFIX = "rate:submit:";
    private static final Set<String> VALID_LANGUAGES = Set.of("JAVA", "CPP", "PYTHON");

    private final SubmissionMapper submissionMapper;
    private final SubmissionDetailMapper submissionDetailMapper;
    private final ProblemMapper problemMapper;
    private final TestCaseMapper testCaseMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public SubmitResponse submit(Long userId, SubmitRequest request) {
        // 校验语言
        if (!VALID_LANGUAGES.contains(request.getLanguage().toUpperCase())) {
            throw new BusinessException(400, "不支持的编程语言: " + request.getLanguage());
        }

        // 提交频率限制（每 5 秒一次），setIfAbsent 保证检查-设置原子性，避免并发绕过
        String rateLimitKey = RATE_LIMIT_PREFIX + userId;
        Boolean firstInWindow = stringRedisTemplate.opsForValue()
                .setIfAbsent(rateLimitKey, "1", Duration.ofSeconds(5));
        if (Boolean.FALSE.equals(firstInWindow)) {
            throw new BusinessException(429, "提交过于频繁，请稍后再试");
        }

        // 校验题目存在
        Problem problem = problemMapper.selectById(request.getProblemId());
        if (problem == null) {
            throw new BusinessException(404, "题目不存在");
        }

        // 写入提交记录（状态 PENDING）
        Submission submission = new Submission();
        submission.setUserId(userId);
        submission.setProblemId(request.getProblemId());
        submission.setLanguage(request.getLanguage().toUpperCase());
        submission.setCodeText(request.getCodeText());
        submission.setStatus("PENDING");
        submission.setTotalTimeMs(0);
        submission.setTotalMemoryKb(0);
        submission.setCreatedAt(LocalDateTime.now());
        submissionMapper.insert(submission);

        // 读取测试用例
        List<TestCase> testCases = testCaseMapper.selectList(
                new LambdaQueryWrapper<TestCase>()
                        .eq(TestCase::getProblemId, request.getProblemId()));

        // 构建判题任务并推送到 Redis 队列
        Map<String, Object> task = new HashMap<>();
        task.put("submissionId", String.valueOf(submission.getId()));
        task.put("problemId", String.valueOf(request.getProblemId()));
        task.put("language", request.getLanguage().toUpperCase());
        task.put("code", request.getCodeText());
        task.put("timeLimit", 5000);
        task.put("memoryLimit", 131072);  // 128MB in KB
        task.put("testCases", testCases.stream().map(tc -> {
            Map<String, Object> tcMap = new HashMap<>();
            tcMap.put("input", tc.getInput());
            tcMap.put("expectedOutput", tc.getExpectedOutput());
            tcMap.put("timeLimit", tc.getTimeLimitMs());
            tcMap.put("memoryLimit", tc.getMemoryLimitKb());
            tcMap.put("isSample", tc.getIsSample());
            return tcMap;
        }).collect(Collectors.toList()));

        final String taskJson;
        try {
            taskJson = objectMapper.writeValueAsString(task);
        } catch (JsonProcessingException e) {
            throw new BusinessException(500, "任务序列化失败");
        }

        // 生成一次性 WebSocket token，值绑定 submissionId:userId，供判题引擎做归属校验
        String wsToken = UUID.randomUUID().toString().replace("-", "");

        // Redis 操作不参与 DB 事务，推迟到事务提交后再执行，避免事务回滚产生无人消费的幽灵任务
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                stringRedisTemplate.opsForList().leftPush(QUEUE_KEY, taskJson);
                stringRedisTemplate.opsForValue().set(
                        WS_TOKEN_PREFIX + wsToken,
                        submission.getId() + ":" + userId,
                        Duration.ofMinutes(5));
            }
        });

        return new SubmitResponse(submission.getId(), wsToken);
    }

    @Override
    public SubmissionVO getDetail(Long submissionId, Long userId, String role) {
        Submission submission = submissionMapper.selectById(submissionId);
        if (submission == null) {
            throw new BusinessException(404, "提交记录不存在");
        }
        // 越权防护：仅本人或管理员可查看（隐藏用例结果不得泄露给他人）
        if (!"ADMIN".equals(role) && !submission.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权查看该提交记录");
        }

        Problem problem = problemMapper.selectById(submission.getProblemId());
        SubmissionVO vo = buildVO(submission, problem);

        // 加载判题详情
        List<SubmissionDetail> details = submissionDetailMapper.selectList(
                new LambdaQueryWrapper<SubmissionDetail>()
                        .eq(SubmissionDetail::getSubmissionId, submissionId)
                        .orderByAsc(SubmissionDetail::getTestCaseIndex));

        vo.setDetails(details.stream().map(d -> {
            SubmissionVO.SubmissionDetailVO dvo = new SubmissionVO.SubmissionDetailVO();
            dvo.setTestCaseIndex(d.getTestCaseIndex());
            dvo.setStatus(d.getStatus());
            dvo.setTimeMs(d.getTimeMs());
            dvo.setMemoryKb(d.getMemoryKb());
            dvo.setActualOutput(d.getActualOutput());
            dvo.setErrorMsg(d.getErrorMsg());
            return dvo;
        }).collect(Collectors.toList()));

        return vo;
    }

    @Override
    public Page<SubmissionVO> listByUser(Long userId, Long problemId, long page, long size) {
        LambdaQueryWrapper<Submission> wrapper = new LambdaQueryWrapper<Submission>()
                .eq(Submission::getUserId, userId)
                .orderByDesc(Submission::getCreatedAt);

        if (problemId != null) {
            wrapper.eq(Submission::getProblemId, problemId);
        }

        Page<Submission> paged = submissionMapper.selectPage(new Page<>(page, size), wrapper);
        List<Submission> submissions = paged.getRecords();

        // 批量加载题目标题
        Set<Long> problemIds = submissions.stream()
                .map(Submission::getProblemId).collect(Collectors.toSet());
        Map<Long, String> titleMap = problemIds.isEmpty() ? Map.of()
                : problemMapper.selectBatchIds(problemIds).stream()
                    .collect(Collectors.toMap(Problem::getId, Problem::getTitle));

        Page<SubmissionVO> voPage = new Page<>(page, size, paged.getTotal());
        voPage.setRecords(submissions.stream().map(s -> {
            SubmissionVO vo = buildVO(s, null);
            vo.setProblemTitle(titleMap.get(s.getProblemId()));
            return vo;
        }).collect(Collectors.toList()));
        return voPage;
    }

    private SubmissionVO buildVO(Submission s, Problem problem) {
        SubmissionVO vo = new SubmissionVO();
        vo.setId(s.getId());
        vo.setUserId(s.getUserId());
        vo.setProblemId(s.getProblemId());
        vo.setProblemTitle(problem != null ? problem.getTitle() : null);
        vo.setLanguage(s.getLanguage());
        vo.setStatus(s.getStatus());
        vo.setTotalTimeMs(s.getTotalTimeMs());
        vo.setTotalMemoryKb(s.getTotalMemoryKb());
        vo.setCompileError(s.getCompileError());
        vo.setCreatedAt(s.getCreatedAt());
        return vo;
    }
}
