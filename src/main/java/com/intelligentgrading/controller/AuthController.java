package com.intelligentgrading.controller;

import com.intelligentgrading.common.Result;
import com.intelligentgrading.dto.LoginRequest;
import com.intelligentgrading.dto.LoginResponse;
import com.intelligentgrading.dto.RegisterRequest;
import com.intelligentgrading.dto.UserVO;
import com.intelligentgrading.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return Result.ok();
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return Result.ok(response);
    }

    @GetMapping("/me")
    public Result<UserVO> me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        UserVO user = userService.getUserById(userId);
        return Result.ok(user);
    }
}
