package com.intelligentgrading.dto;

import lombok.Data;

@Data
public class RankingItemVO {

    private Long userId;
    private String username;
    private String nickname;
    private Long totalSubmissions;
    private Long acceptedCount;
    private Double acceptRate;    // 0.0 ~ 100.0
}
