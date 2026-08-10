package com.intelligentgrading.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.intelligentgrading.dto.SubmitRequest;
import com.intelligentgrading.dto.SubmitResponse;
import com.intelligentgrading.dto.SubmissionVO;

public interface SubmissionService {

    /**
     * 提交代码：写DB → 入Redis队列 → 返回WebSocket token
     */
    SubmitResponse submit(Long userId, SubmitRequest request);

    /**
     * 获取提交详情（含判题结果）；仅本人或管理员可查看
     */
    SubmissionVO getDetail(Long submissionId, Long userId, String role);

    /**
     * 获取当前用户的提交列表（分页）
     */
    Page<SubmissionVO> listByUser(Long userId, Long problemId, long page, long size);
}
