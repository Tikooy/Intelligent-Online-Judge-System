package com.intelligentgrading.controller;

import com.intelligentgrading.common.Result;
import com.intelligentgrading.dto.UserStatsVO;
import com.intelligentgrading.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final RankingService rankingService;

    @GetMapping("/{id}/stats")
    public Result<UserStatsVO> stats(@PathVariable Long id) {
        return Result.ok(rankingService.getUserStats(id));
    }
}
