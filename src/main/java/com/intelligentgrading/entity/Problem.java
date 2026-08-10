package com.intelligentgrading.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("problem")
public class Problem {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String description;
    private String difficulty;    // EASY / MEDIUM / HARD
    private String inputFormat;
    private String outputFormat;
    private String sampleInput;
    private String sampleOutput;
    private String referenceCode;   // JSON: {"JAVA":"...","CPP":"...","PYTHON":"..."}
    private LocalDateTime createdAt;
}
