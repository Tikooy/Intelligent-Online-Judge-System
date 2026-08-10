package com.intelligentgrading.service;

import com.intelligentgrading.dto.RankingItemVO;
import com.intelligentgrading.dto.UserStatsVO;

import java.util.List;

public interface RankingService {

    /**
     * 获取排行榜（前50名，按通过数降序）
     */
    List<RankingItemVO> getRanking();

    /**
     * 获取用户答题统计
     */
    UserStatsVO getUserStats(Long userId);
}
