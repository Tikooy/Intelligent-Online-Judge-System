const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DB || 'intelligent_grading',
    waitForConnections: true,
    connectionLimit: 5,
});

/**
 * 更新提交结果到 MySQL
 */
async function updateSubmissionResult(submissionId, result) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 更新 submission 主表
        await conn.execute(
            `UPDATE submission SET status = ?, total_time_ms = ?, total_memory_kb = ?, compile_error = ?
             WHERE id = ?`,
            [result.status, result.totalTimeMs, result.totalMemoryKb, result.compileError, submissionId]
        );

        // 写入每个测试点详情
        const detailSql = `INSERT INTO submission_detail
            (submission_id, test_case_index, status, time_ms, memory_kb, actual_output, error_msg)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        for (const tc of result.testCases) {
            await conn.execute(detailSql, [
                submissionId,
                tc.testCaseIndex,
                tc.status,
                tc.timeMs,
                tc.memoryKb,
                tc.actualOutput,
                tc.errorMsg,
            ]);
        }

        await conn.commit();
        console.log(`[DB] Submission ${submissionId} result updated: ${result.status}`);
    } catch (err) {
        await conn.rollback();
        console.error(`[DB] Failed to update submission ${submissionId}:`, err.message);
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * 查询提交结果快照（供 WebSocket 建立连接时补偿推送，
 * 避免判题已完成而客户端连接尚未建立时消息丢失）
 */
async function getSubmissionSnapshot(submissionId) {
    const [rows] = await pool.query(
        `SELECT status, total_time_ms, total_memory_kb FROM submission WHERE id = ?`,
        [submissionId]
    );
    if (!rows.length) return null;

    const [details] = await pool.query(
        `SELECT test_case_index, status, time_ms FROM submission_detail
         WHERE submission_id = ? ORDER BY test_case_index`,
        [submissionId]
    );

    return {
        status: rows[0].status,
        totalTimeMs: rows[0].total_time_ms,
        totalMemoryKb: rows[0].total_memory_kb,
        testCases: details.map((d) => ({
            testCaseIndex: d.test_case_index,
            status: d.status,
            timeMs: d.time_ms,
        })),
    };
}

module.exports = { updateSubmissionResult, getSubmissionSnapshot, pool };
