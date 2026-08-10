package com.intelligentgrading.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.intelligentgrading.entity.TestCase;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TestCaseMapper extends BaseMapper<TestCase> {
}
