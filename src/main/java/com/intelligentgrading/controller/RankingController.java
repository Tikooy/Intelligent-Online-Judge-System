package com.intelligentgrading.controller;

import com.intelligentgrading.common.Result;
import com.intelligentgrading.dto.RankingItemVO;
import com.intelligentgrading.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping
    public Result<List<RankingItemVO>> ranking() {
        return Result.ok(rankingService.getRanking());
    }
}
