package com.intelligentgrading.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.intelligentgrading.dto.RankingItemVO;
import com.intelligentgrading.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("""
        SELECT u.id AS userId, u.username, u.nickname,
               COUNT(s.id) AS totalSubmissions,
               COALESCE(SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END), 0) AS acceptedCount,
               COALESCE(ROUND(SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(s.id), 0), 1), 0) AS acceptRate
        FROM user u
        LEFT JOIN submission s ON u.id = s.user_id
        WHERE u.role <> 'ADMIN'
        GROUP BY u.id
        ORDER BY acceptedCount DESC, acceptRate DESC
        LIMIT 50
        """)
    List<RankingItemVO> getRanking();

    /**
     * 计算单个用户的排名（RANK，并列名次），避免每次全量构建排行榜
     */
    @Select("""
        SELECT rnk FROM (
            SELECT u.id AS uid,
                   RANK() OVER (
                       ORDER BY COALESCE(SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END), 0) DESC,
                                COALESCE(ROUND(SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END) * 100.0
                                       / NULLIF(COUNT(s.id), 0), 1), 0) DESC
                   ) AS rnk
            FROM user u
            LEFT JOIN submission s ON u.id = s.user_id
            WHERE u.role <> 'ADMIN'
            GROUP BY u.id
        ) t
        WHERE t.uid = #{userId}
        """)
    Integer getUserRank(@Param("userId") Long userId);
}

