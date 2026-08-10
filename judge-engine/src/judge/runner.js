const { createContainer } = require('../docker/DockerManager');
const { createWorkDir, cleanupWorkDir } = require('./workdir');
const path = require('path');
const fs = require('fs');

// 容器内工作目录统一为 /code，所有路径以此为基准
const CONTAINER_WORKDIR = '/code';

const RUN_COMMANDS = {
    JAVA: (binary) => `java -cp ${CONTAINER_WORKDIR} ${binary}`,
    CPP:  (binary) => `${CONTAINER_WORKDIR}/${binary}`,
    PYTHON: () => `python3 ${CONTAINER_WORKDIR}/main.py`,
};

async function run({ language, executable, input, timeLimit, memoryLimit }) {
    // 确定挂载到容器的 host 目录
    const mountDir = language === 'PYTHON'
        ? createWorkDir('run')
        : executable.workDir;

    // 将输入写入挂载目录，确保容器内 /code/input.txt 可访问
    const inputFile = path.join(mountDir, 'input.txt');
    fs.writeFileSync(inputFile, input);

    // Python: 还需将代码写入挂载目录
    if (language === 'PYTHON') {
        const scriptPath = path.join(mountDir, 'main.py');
        fs.writeFileSync(scriptPath, executable.code);
    }

    const cmd = RUN_COMMANDS[language](executable.binary);

    // 用 shell 脚本包装：重定向输入，限制资源
    const shellCmd = `
cat ${CONTAINER_WORKDIR}/input.txt | timeout ${Math.ceil(timeLimit / 1000)}s ${cmd}
`;

    try {
        const container = await createContainer({
            image: 'judge-sandbox:latest',
            cmd: ['/bin/sh', '-c', shellCmd],
            workDir: CONTAINER_WORKDIR,
            bindMount: { host: mountDir, container: CONTAINER_WORKDIR },
            memoryLimit,
            timeout: Math.ceil(timeLimit / 1000) + 3,
        });

        const result = await container.run();

        if (language === 'PYTHON') {
            cleanupWorkDir(mountDir);
        } else {
            // 清理 input.txt，保留编译产物供后续测试点复用
            try { fs.unlinkSync(inputFile); } catch { /* ignore */ }
        }

        return {
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            exitCode: result.exitCode,
            timedOut: result.timedOut || false,
            memoryExceeded: result.memoryExceeded || false,
            timeMs: result.timeMs || 0,
            memoryKb: result.memoryKb || 0,
        };
    } catch (err) {
        if (language === 'PYTHON') {
            cleanupWorkDir(mountDir);
        }
        return {
            stdout: '',
            stderr: err.message,
            exitCode: -1,
            timedOut: false,
            memoryExceeded: false,
            timeMs: 0,
            memoryKb: 0,
        };
    }
}

module.exports = { run };
