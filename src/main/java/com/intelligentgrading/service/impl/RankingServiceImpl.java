package com.intelligentgrading.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.intelligentgrading.common.BusinessException;
import com.intelligentgrading.dto.RankingItemVO;
import com.intelligentgrading.dto.UserStatsVO;
import com.intelligentgrading.entity.Problem;
import com.intelligentgrading.entity.Submission;
import com.intelligentgrading.entity.User;
import com.intelligentgrading.mapper.ProblemMapper;
import com.intelligentgrading.mapper.SubmissionMapper;
import com.intelligentgrading.mapper.UserMapper;
import com.intelligentgrading.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final UserMapper userMapper;
    private final SubmissionMapper submissionMapper;
    private final ProblemMapper problemMapper;

    @Override
    public List<RankingItemVO> getRanking() {
        return userMapper.getRanking();
    }

    @Override
    public UserStatsVO getUserStats(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        UserStatsVO stats = new UserStatsVO();
        stats.setUserId(user.getId());
        stats.setUsername(user.getUsername());
        stats.setNickname(user.getNickname());
        stats.setRole(user.getRole());

        // 提交统计
        Long total = submissionMapper.selectCount(
                new LambdaQueryWrapper<Submission>().eq(Submission::getUserId, userId));
        Long accepted = submissionMapper.selectCount(
                new LambdaQueryWrapper<Submission>()
                        .eq(Submission::getUserId, userId)
                        .eq(Submission::getStatus, "ACCEPTED"));

        stats.setTotalSubmissions(total);
        stats.setAcceptedCount(accepted);
        stats.setAcceptRate(total > 0 ? Math.round(accepted * 1000.0 / total) / 10.0 : 0.0);

        // 排名：单用户排名查询（RANK 窗口函数），避免每次全表构建排行榜
        Integer rank = userMapper.getUserRank(userId);
        stats.setRank(rank != null ? rank : 0);

        // 最近 5 条提交
        List<Submission> recent = submissionMapper.selectList(
                new LambdaQueryWrapper<Submission>()
                        .eq(Submission::getUserId, userId)
                        .orderByDesc(Submission::getCreatedAt)
                        .last("LIMIT 5"));

        // 批量获取题目标题；无提交记录时跳过，避免 selectBatchIds(空集) 生成 IN () 语法错误
        Set<Long> problemIds = recent.stream().map(Submission::getProblemId).collect(Collectors.toSet());
        Map<Long, String> titleMap = problemIds.isEmpty() ? Map.of()
                : problemMapper.selectBatchIds(problemIds)
                        .stream().collect(Collectors.toMap(Problem::getId, Problem::getTitle));

        stats.setRecentSubmissions(recent.stream().map(s -> {
            UserStatsVO.RecentSubmission rs = new UserStatsVO.RecentSubmission();
            rs.setId(s.getId());
            rs.setProblemId(s.getProblemId());
            rs.setProblemTitle(titleMap.get(s.getProblemId()));
            rs.setStatus(s.getStatus());
            rs.setCreatedAt(s.getCreatedAt().toString());
            return rs;
        }).collect(Collectors.toList()));

        return stats;
    }
}
