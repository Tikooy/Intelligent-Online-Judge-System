const Redis = require('ioredis');
const os = require('os');
const { judge } = require('./judge/judgeService');
const { updateSubmissionResult, pool } = require('./db/dbService');
const { pushToClient } = require('./websocket/wsHandler');

const QUEUE_KEY = 'queue:submissions';
const RECOVERY_INTERVAL_MS = 60 * 1000;
const STALE_AFTER_MINUTES = 5;

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

async function processTask(task) {
    const submissionId = task.submissionId;
    console.log(`[Worker] Processing submission: ${submissionId}`);
    const { problemId, language, code, testCases, timeLimit, memoryLimit } = task;

    try {
        const judgeResult = await judge({
            submissionId,
            language,
            code,
            testCases,
            timeLimit,
            memoryLimit,
            onProgress: (event) => {
                pushToClient(submissionId, event);
            },
        });

        await updateSubmissionResult(submissionId, judgeResult);

        pushToClient(submissionId, {
            type: 'COMPLETED',
            status: judgeResult.status,
            summary: {
                totalTimeMs: judgeResult.totalTimeMs,
                totalMemoryKb: judgeResult.totalMemoryKb,
                passedCount: judgeResult.testCases.filter(t => t.status === 'PASSED').length,
                totalCount: judgeResult.testCases.length,
            },
        });
    } catch (err) {
        console.error('[Worker] Error processing submission:', err.message);
        try {
            await updateSubmissionResult(submissionId, {
                status: 'SYSTEM_ERROR',
                compileError: null,
                totalTimeMs: 0,
                totalMemoryKb: 0,
                testCases: [],
            });
            pushToClient(submissionId, {
                type: 'COMPLETED',
                status: 'SYSTEM_ERROR',
                summary: { totalTimeMs: 0, totalMemoryKb: 0, passedCount: 0, totalCount: 0 },
            });
        } catch (dbErr) {
            console.error('[Worker] Failed to update error status:', dbErr.message);
        }
    }
}

async function consumeLoop() {
    while (true) {
        try {
            const result = await redis.blpop(QUEUE_KEY, 0);
            if (!result) continue;
            const task = JSON.parse(result[1]);
            await processTask(task);
        } catch (err) {
            console.error('[Worker] Consumer loop error:', err.message);
            // 失败后稍作停顿，避免空转刷屏
            await new Promise((r) => setTimeout(r, 1000));
        }
    }
}

/**
 * 恢复卡在 PENDING 的提交：worker 崩溃或消息丢失时，BLPOP 取走的任务无人消费，
 * 提交会永久停在 PENDING。启动时和定时扫描超时未完成的提交，重新入队。
 */
async function recoverStalePending() {
    try {
        const [rows] = await pool.query(
            `SELECT id, problem_id, language, code_text
             FROM submission
             WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL ? MINUTE`,
            [STALE_AFTER_MINUTES]
        );
        for (const row of rows) {
            const [cases] = await pool.query(
                `SELECT input, expected_output, time_limit_ms, memory_limit_kb, is_sample
                 FROM test_case WHERE problem_id = ?`,
                [row.problem_id]
            );
            const task = {
                submissionId: String(row.id),
                problemId: String(row.problem_id),
                language: row.language,
                code: row.code_text,
                timeLimit: 5000,
                memoryLimit: 131072,
                testCases: cases.map((tc) => ({
                    input: tc.input,
                    expectedOutput: tc.expected_output,
                    timeLimit: tc.time_limit_ms,
                    memoryLimit: tc.memory_limit_kb,
                    isSample: tc.is_sample,
                })),
            };
            await redis.rpush(QUEUE_KEY, JSON.stringify(task));
            console.log(`[Worker] Recovered stale PENDING submission ${row.id}`);
        }
    } catch (err) {
        console.error('[Worker] Recovery scan error:', err.message);
    }
}

function startWorker() {
    const concurrency = Math.max(1,
        Number(process.env.WORKER_CONCURRENCY) || Math.min(os.cpus().length || 1, 4));
    console.log(`[Worker] Starting ${concurrency} concurrent consumers, waiting for submissions...`);

    // BLPOP 多消费者安全：Redis 保证每条消息只投递给一个消费者
    for (let i = 0; i < concurrency; i++) {
        consumeLoop().catch((e) => console.error('[Worker] Consumer crashed:', e.message));
    }

    recoverStalePending();
    setInterval(recoverStalePending, RECOVERY_INTERVAL_MS);
}

module.exports = { startWorker };
