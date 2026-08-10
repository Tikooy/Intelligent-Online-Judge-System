const Docker = require('dockerode');

const dockerOptions = {};
if (process.env.DOCKER_HOST) {
    dockerOptions.host = process.env.DOCKER_HOST;
} else if (process.env.DOCKER_SOCKET) {
    dockerOptions.socketPath = process.env.DOCKER_SOCKET;
} else if (process.platform === 'win32') {
    dockerOptions.socketPath = '//./pipe/dockerDesktopLinuxEngine';
}

const docker = new Docker(dockerOptions);

const MAX_LOG_BYTES = 1024 * 1024; // 单流日志上限 1MB，防输出炸弹拖垮进程

/**
 * 创建判题容器并执行
 */
async function createContainer({ image, cmd, workDir, bindMount, memoryLimit, timeout }) {
    const containerConfig = {
        Image: image,
        Cmd: cmd,
        WorkingDir: workDir || '/code',
        HostConfig: {
            Memory: (memoryLimit || 131072) * 1024,        // 转换为字节
            MemorySwap: (memoryLimit || 131072) * 1024,     // 禁止 swap
            NanoCpus: 300000000,                             // 0.3 CPU
            NetworkMode: 'none',                             // 禁止网络
            ReadonlyRootfs: true,                            // 只读根文件系统
            PidsLimit: 256,                                  // 防 fork 炸弹
            CapDrop: ['ALL'],                                // 丢弃所有 Linux capabilities
            SecurityOpt: ['no-new-privileges:true'],         // 禁止提权
            LogConfig: {                                     // 限制容器日志大小，防磁盘/内存被输出撑爆
                Type: 'json-file',
                Config: { 'max-size': '1m', 'max-file': '1' },
            },
            AutoRemove: false,
            Binds: bindMount
                ? [`${bindMount.host}:${bindMount.container}:rw`]
                : undefined,
        },
    };

    const container = await docker.createContainer(containerConfig);

    return {
        async run() {
            const startTime = Date.now();

            try {
                await container.start();

                // 超时控制（完成后清理定时器，避免事件循环滞留）
                let timeoutHandle;
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutHandle = setTimeout(() => reject(new Error('TIMEOUT')), (timeout || 10) * 1000);
                });

                const runPromise = container.wait();

                const result = await Promise.race([runPromise, timeoutPromise]);
                clearTimeout(timeoutHandle);

                const endTime = Date.now();

                // 获取日志（stdout/stderr），解析时截断超长输出
                const logs = await container.logs({
                    stdout: true,
                    stderr: true,
                });

                const stdout = [];
                const stderr = [];
                let stdoutBytes = 0;
                let stderrBytes = 0;
                let truncated = false;
                let offset = 0;
                while (offset < logs.length) {
                    const streamType = logs[offset];  // 1=stdout, 2=stderr
                    const size = logs.readUInt32BE(offset + 4);
                    offset += 8;
                    const chunk = logs.slice(offset, offset + size).toString('utf-8');
                    offset += size;
                    const budget = streamType === 1 ? (MAX_LOG_BYTES - stdoutBytes) : (MAX_LOG_BYTES - stderrBytes);
                    if (budget <= 0) {
                        truncated = true;
                        continue;
                    }
                    const cut = Math.min(budget, chunk.length);
                    if (streamType === 1) {
                        stdout.push(chunk.slice(0, cut));
                        stdoutBytes += cut;
                    } else if (streamType === 2) {
                        stderr.push(chunk.slice(0, cut));
                        stderrBytes += cut;
                    }
                }

                const stdoutText = stdout.join('');
                const stderrText = stderr.join('');
                if (truncated) {
                    (stdoutText ? stderr : stdout).push('...(output truncated, exceeded 1MB)');
                }

                // 检查 OOM
                const inspect = await container.inspect();
                const memoryExceeded = inspect.State.OOMKilled || false;

                // 读取内存使用
                let memoryKb = 0;
                try {
                    const statsStream = await container.stats({ stream: true });
                    const statsData = await new Promise((resolve) => {
                        let statsTimer;
                        const finish = (data) => {
                            clearTimeout(statsTimer);
                            statsStream.destroy();
                            resolve(data);
                        };
                        statsStream.on('data', (data) => {
                            let parsed;
                            try {
                                parsed = JSON.parse(data.toString());
                            } catch {
                                parsed = null;
                            }
                            finish(parsed);
                        });
                        statsStream.on('error', () => finish(null));
                        statsTimer = setTimeout(() => finish(null), 500);
                    });
                    if (statsData && statsData.memory_stats && statsData.memory_stats.usage) {
                        memoryKb = Math.round(statsData.memory_stats.usage / 1024);
                    }
                } catch {
                    // stats unavailable
                }

                return {
                    exitCode: result.StatusCode,
                    stdout: stdoutText,
                    stderr: stderrText,
                    timedOut: false,
                    memoryExceeded,
                    timeMs: endTime - startTime,
                    memoryKb,
                };
            } catch (err) {
                if (err.message === 'TIMEOUT') {
                    await container.kill();
                    return {
                        exitCode: -1,
                        stdout: '',
                        stderr: '',
                        timedOut: true,
                        memoryExceeded: false,
                        timeMs: (timeout || 10) * 1000,
                        memoryKb: 0,
                    };
                }
                throw err;
            } finally {
                await container.remove({ force: true }).catch(() => {});
            }
        },
    };
}

module.exports = { createContainer, removeContainer: () => {} };
