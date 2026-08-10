package com.intelligentgrading.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubmitResponse {

    private Long submissionId;
    private String wsToken;     // 一次性 WebSocket 连接 token
}
