package com.intelligentgrading.service;

import com.intelligentgrading.dto.LoginRequest;
import com.intelligentgrading.dto.LoginResponse;
import com.intelligentgrading.dto.RegisterRequest;
import com.intelligentgrading.dto.UserVO;

public interface UserService {

    /**
     * 用户注册
     */
    void register(RegisterRequest request);

    /**
     * 用户登录，返回 JWT token + 用户信息
     */
    LoginResponse login(LoginRequest request);

    /**
     * 根据用户 ID 获取用户信息
     */
    UserVO getUserById(Long userId);
}
