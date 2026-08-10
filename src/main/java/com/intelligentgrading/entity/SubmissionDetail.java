package com.intelligentgrading.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("submission_detail")
public class SubmissionDetail {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long submissionId;
    private Integer testCaseIndex;
    private String status;        // PASSED / WRONG_ANSWER / RUNTIME_ERROR / TIME_LIMIT_EXCEEDED / MEMORY_LIMIT_EXCEEDED
    private Integer timeMs;
    private Integer memoryKb;
    private String actualOutput;
    private String errorMsg;
}
