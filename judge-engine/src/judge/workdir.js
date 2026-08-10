const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * 判题工作根目录。
 * - 本地开发：os.tmpdir()，Windows 下为完整盘符路径，Docker Desktop 可挂载
 * - Docker 部署：JUDGE_WORK_ROOT 指向宿主可见的共享目录（docker-compose 将
 *   ./judge-work 双向映射到容器 /host-work，daemon 解析的 host 路径与容器内路径一致）
 */
function workRoot() {
    return process.env.JUDGE_WORK_ROOT || os.tmpdir();
}

function createWorkDir(prefix) {
    const dir = path.join(workRoot(), `${prefix}-${uuidv4()}`);
    fs.mkdirSync(dir, { recursive: true });
    // 沙箱容器以非 root runner 用户（uid 1000）运行，需对工作目录可写；
    // 本地与部署场景 uid 可能不同，放宽到 777 保证挂载目录可写
    try {
        fs.chmodSync(dir, 0o777);
    } catch {
        // 某些平台 chmod 失败可忽略
    }
    return dir;
}

function cleanupWorkDir(dir) {
    if (!dir) return;
    try {
        fs.rmSync(dir, { recursive: true, force: true });
    } catch {
        // 清理失败不阻塞判题
    }
}

module.exports = { createWorkDir, cleanupWorkDir, workRoot };
