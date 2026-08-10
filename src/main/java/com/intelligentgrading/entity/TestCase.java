package com.intelligentgrading.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("test_case")
public class TestCase {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long problemId;
    private String input;
    private String expectedOutput;
    private Integer timeLimitMs;
    private Integer memoryLimitKb;
    private Boolean isSample;
}
