package com.intelligentgrading.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.intelligentgrading.common.BusinessException;
import com.intelligentgrading.common.JwtUtil;
import com.intelligentgrading.dto.LoginRequest;
import com.intelligentgrading.dto.LoginResponse;
import com.intelligentgrading.dto.RegisterRequest;
import com.intelligentgrading.dto.UserVO;
import com.intelligentgrading.entity.User;
import com.intelligentgrading.mapper.UserMapper;
import com.intelligentgrading.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String LOGIN_LIMIT_PREFIX = "rate:login:";
    private static final int LOGIN_LIMIT_WINDOW_SECONDS = 60;
    private static final int LOGIN_LIMIT_MAX_ATTEMPTS = 10;

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void register(RegisterRequest request) {
        // 检查用户名是否已存在
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (count > 0) {
            throw new BusinessException(400, "用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());

        userMapper.insert(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 登录防爆破限流：同一用户名 60 秒内最多尝试 10 次
        String limitKey = LOGIN_LIMIT_PREFIX + request.getUsername().toLowerCase();
        Long attempts = stringRedisTemplate.opsForValue().increment(limitKey);
        if (attempts != null && attempts == 1) {
            stringRedisTemplate.expire(limitKey, Duration.ofSeconds(LOGIN_LIMIT_WINDOW_SECONDS));
        }
        if (attempts != null && attempts > LOGIN_LIMIT_MAX_ATTEMPTS) {
            throw new BusinessException(429, "登录尝试次数过多，请稍后再试");
        }

        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));

        if (user == null) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        // 登录成功，清除限流计数
        stringRedisTemplate.delete(limitKey);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        UserVO userVO = new UserVO(
                user.getId(), user.getUsername(), user.getNickname(),
                user.getRole(), user.getCreatedAt());

        return new LoginResponse(token, userVO);
    }

    @Override
    public UserVO getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return new UserVO(
                user.getId(), user.getUsername(), user.getNickname(),
                user.getRole(), user.getCreatedAt());
    }
}
