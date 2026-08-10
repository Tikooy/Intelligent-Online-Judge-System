package com.intelligentgrading.controller;

import com.intelligentgrading.common.Result;
import com.intelligentgrading.dto.ProblemSaveRequest;
import com.intelligentgrading.dto.TestCaseUploadRequest;
import com.intelligentgrading.entity.Problem;
import com.intelligentgrading.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/problems")
@RequiredArgsConstructor
public class AdminController {

    private final ProblemService problemService;

    @PostMapping
    public Result<Problem> create(@Valid @RequestBody ProblemSaveRequest request) {
        return Result.ok(problemService.create(request));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ProblemSaveRequest request) {
        problemService.update(id, request);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        problemService.delete(id);
        return Result.ok();
    }

    @PostMapping("/{id}/test-cases")
    public Result<Void> uploadTestCases(@PathVariable Long id,
                                        @Valid @RequestBody TestCaseUploadRequest request) {
        problemService.uploadTestCases(id, request);
        return Result.ok();
    }
}
