package com.intelligentgrading.service;

import com.intelligentgrading.dto.AdminDashboardVO;

public interface AdminService {

    /**
     * 管理员仪表盘聚合数据
     */
    AdminDashboardVO getDashboard();
}
