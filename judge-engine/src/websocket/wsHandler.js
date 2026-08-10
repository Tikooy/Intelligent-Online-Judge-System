const WebSocket = require('ws');
const Redis = require('ioredis');
const { getSubmissionSnapshot } = require('../db/dbService');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

// submissionId → Set<WebSocket>
const clients = new Map();

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server, path: '/ws/judge' });

    wss.on('connection', async (ws, req) => {
        // 从 URL 参数获取 token
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('token');
        const submissionId = url.searchParams.get('submissionId');

        if (!token || !submissionId) {
            ws.close(4001, 'Missing token or submissionId');
            return;
        }

        // 验证 token，并校验 submissionId 归属（token 值绑定 submissionId:userId）
        const bound = await redis.get(`ws:token:${token}`);
        if (!bound) {
            ws.close(4002, 'Invalid or expired token');
            return;
        }
        const [boundSubmissionId, boundUserId] = bound.split(':');
        if (boundSubmissionId !== submissionId) {
            ws.close(4003, 'Forbidden: submission not owned by this token');
            return;
        }

        // 限制单个 token 的并发连接数，防止 token 复用开无限连接
        const CONN_LIMIT = 2;
        const connCountKey = `ws:token:${token}:conns`;
        const conns = await redis.incr(connCountKey);
        await redis.expire(connCountKey, 300);
        if (conns > CONN_LIMIT) {
            await redis.decr(connCountKey);
            ws.close(4004, 'Too many connections for this token');
            return;
        }

        // 注册客户端
        if (!clients.has(submissionId)) {
            clients.set(submissionId, new Set());
        }
        clients.get(submissionId).add(ws);

        console.log(`[WebSocket] Client connected for submission ${submissionId}`);

        // 补偿推送：若该提交已判完（WS 建立晚于判题完成），立即推送完整结果快照，
        // 避免前端收不到任何实时消息导致判题结果区空白
        getSubmissionSnapshot(submissionId).then((snapshot) => {
            if (snapshot && snapshot.status && snapshot.status !== 'PENDING') {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'COMPLETED',
                        status: snapshot.status,
                        summary: {
                            totalTimeMs: snapshot.totalTimeMs,
                            totalMemoryKb: snapshot.totalMemoryKb,
                            passedCount: snapshot.testCases.filter(t => t.status === 'PASSED').length,
                            totalCount: snapshot.testCases.length,
                        },
                    }));
                }
            }
        }).catch(() => {});

        ws.on('close', () => {
            redis.decr(connCountKey).catch(() => {});
            const set = clients.get(submissionId);
            if (set) {
                set.delete(ws);
                if (set.size === 0) clients.delete(submissionId);
            }
        });
    });

    console.log('[WebSocket] Ready on /ws/judge');
}

/**
 * 向指定提交的所有客户端推送消息
 */
function pushToClient(submissionId, data) {
    const set = clients.get(String(submissionId));
    if (!set) return;

    const message = JSON.stringify(data);
    for (const ws of set) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    }
}

module.exports = { setupWebSocket, pushToClient };
