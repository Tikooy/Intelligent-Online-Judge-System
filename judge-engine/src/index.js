const express = require('express');
const http = require('http');
const { setupWebSocket } = require('./websocket/wsHandler');
const { startWorker } = require('./worker');

const app = express();
const server = http.createServer(app);

app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'judge-engine' });
});

// 启动 WebSocket
setupWebSocket(server);

// 启动 Redis 队列消费者
startWorker();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Judge Engine] running on port ${PORT}`);
});
