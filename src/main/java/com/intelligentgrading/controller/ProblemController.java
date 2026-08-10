package com.intelligentgrading.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.intelligentgrading.common.Result;
import com.intelligentgrading.dto.ProblemDetailVO;
import com.intelligentgrading.dto.ProblemPageRequest;
import com.intelligentgrading.dto.ProblemVO;
import com.intelligentgrading.service.ProblemService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public Result<Page<ProblemVO>> list(ProblemPageRequest request) {
        return Result.ok(problemService.pageQuery(request));
    }

    @GetMapping("/{id}")
    public Result<ProblemDetailVO> detail(@PathVariable Long id,
                                          HttpServletRequest httpRequest) {
        // userId 可能为 null（未登录），用于控制参考代码是否返回
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.ok(problemService.getDetail(id, userId));
    }
}
