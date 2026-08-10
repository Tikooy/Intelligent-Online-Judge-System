package com.intelligentgrading.controller;

import com.intelligentgrading.common.Result;
import com.intelligentgrading.dto.AdminDashboardVO;
import com.intelligentgrading.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public Result<AdminDashboardVO> dashboard() {
        return Result.ok(adminService.getDashboard());
    }
}
