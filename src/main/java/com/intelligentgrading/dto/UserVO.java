package com.intelligentgrading.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserVO {

    private Long id;
    private String username;
    private String nickname;
    private String role;
    private LocalDateTime createdAt;
}
