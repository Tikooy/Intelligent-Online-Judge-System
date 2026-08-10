package com.intelligentgrading.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.intelligentgrading.dto.ProblemStatVO;
import com.intelligentgrading.entity.Submission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SubmissionMapper extends BaseMapper<Submission> {

    @Select("""
        <script>
        SELECT problem_id AS problemId,
               COUNT(*) AS totalSubmissions,
               COALESCE(SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END), 0) AS acceptedCount
        FROM submission
        WHERE problem_id IN
        <foreach collection='problemIds' item='id' open='(' separator=',' close=')'>
            #{id}
        </foreach>
        GROUP BY problem_id
        </script>
        """)
    List<ProblemStatVO> getStatsByProblemIds(@Param("problemIds") List<Long> problemIds);

    /**
     * 单个题目的提交统计（详情页用），单条聚合查询替代两次 COUNT
     */
    @Select("""
        SELECT problem_id AS problemId,
               COUNT(*) AS totalSubmissions,
               COALESCE(SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END), 0) AS acceptedCount
        FROM submission
        WHERE problem_id = #{problemId}
        """)
    ProblemStatVO getStatsByProblemId(@Param("problemId") Long problemId);
}
