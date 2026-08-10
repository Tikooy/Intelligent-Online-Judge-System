package com.intelligentgrading.dto;

import lombok.Data;

@Data
public class ProblemPageRequest {

    private String keyword;       // 标题模糊搜索
    private String difficulty;    // EASY / MEDIUM / HARD，空=全部
    private Integer page = 1;
    private Integer size = 10;
}
