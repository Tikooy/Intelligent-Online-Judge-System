package com.intelligentgrading.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.intelligentgrading.common.Result;
import com.intelligentgrading.dto.SubmitRequest;
import com.intelligentgrading.dto.SubmitResponse;
import com.intelligentgrading.dto.SubmissionVO;
import com.intelligentgrading.service.SubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public Result<SubmitResponse> submit(@Valid @RequestBody SubmitRequest request,
                                         HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.ok(submissionService.submit(userId, request));
    }

    @GetMapping("/{id}")
    public Result<SubmissionVO> detail(@PathVariable Long id,
                                       HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        String role = (String) httpRequest.getAttribute("role");
        return Result.ok(submissionService.getDetail(id, userId, role));
    }

    @GetMapping
    public Result<Page<SubmissionVO>> list(HttpServletRequest httpRequest,
                                            @RequestParam(required = false) Long problemId,
                                            @RequestParam(defaultValue = "1") long page,
                                            @RequestParam(defaultValue = "20") long size) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.ok(submissionService.listByUser(userId, problemId, page, size));
    }
}
