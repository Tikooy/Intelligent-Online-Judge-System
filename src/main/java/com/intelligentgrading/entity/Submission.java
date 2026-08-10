package com.intelligentgrading.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("submission")
public class Submission {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long problemId;
    private String language;      // JAVA / CPP / PYTHON
    private String codeText;
    private String status;        // ACCEPTED / WRONG_ANSWER / COMPILE_ERROR / RUNTIME_ERROR / TIME_LIMIT_EXCEEDED / MEMORY_LIMIT_EXCEEDED
    private Integer totalTimeMs;
    private Integer totalMemoryKb;
    private String compileError;
    private LocalDateTime createdAt;
}
