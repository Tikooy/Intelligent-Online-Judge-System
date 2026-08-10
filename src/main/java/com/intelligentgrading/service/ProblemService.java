package com.intelligentgrading.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.intelligentgrading.dto.*;
import com.intelligentgrading.entity.Problem;

public interface ProblemService {

    /**
     * 分页搜索题目列表
     */
    Page<ProblemVO> pageQuery(ProblemPageRequest request);

    /**
     * 获取题目详情；userId 为 null 表示未登录，此时不返回参考代码
     */
    ProblemDetailVO getDetail(Long problemId, Long userId);

    /**
     * 新增题目（管理员）
     */
    Problem create(ProblemSaveRequest request);

    /**
     * 更新题目（管理员）
     */
    void update(Long problemId, ProblemSaveRequest request);

    /**
     * 删除题目（管理员）
     */
    void delete(Long problemId);

    /**
     * 批量上传测试用例（管理员）
     */
    void uploadTestCases(Long problemId, TestCaseUploadRequest request);
}
