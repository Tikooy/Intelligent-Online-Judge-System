package com.intelligentgrading.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.intelligentgrading.entity.Problem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProblemMapper extends BaseMapper<Problem> {
}
