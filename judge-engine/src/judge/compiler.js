const { createContainer, removeContainer } = require('../docker/DockerManager');
const { createWorkDir, cleanupWorkDir } = require('./workdir');
const path = require('path');
const fs = require('fs');

const COMPILE_COMMANDS = {
    JAVA: (srcFile) => `javac ${srcFile} -d /code`,
    CPP: (srcFile) => `g++ ${srcFile} -o /code/program -O2`,
    PYTHON: null,
};

const SOURCE_FILES = {
    JAVA: 'Main.java',
    CPP: 'main.cpp',
    PYTHON: 'main.py',
};

async function compile(language, code) {
    if (language === 'PYTHON') {
        return {
            success: true,
            executable: { type: 'script', language: 'PYTHON', code },
        };
    }

    const workDir = createWorkDir('compile');
    const srcFile = path.join(workDir, SOURCE_FILES[language]);
    fs.writeFileSync(srcFile, code);

    try {
        const compileCmd = COMPILE_COMMANDS[language](SOURCE_FILES[language]);

        const container = await createContainer({
            image: 'judge-sandbox:latest',
            cmd: ['/bin/sh', '-c', compileCmd],
            workDir: '/code',
            bindMount: { host: workDir, container: '/code' },
            timeout: 30,
        });

        const result = await container.run();

        if (result.exitCode !== 0) {
            cleanupWorkDir(workDir);
            return {
                success: false,
                error: result.stderr || 'Compilation failed',
            };
        }

        return {
            success: true,
            executable: {
                type: 'binary',
                language,
                workDir,
                binary: language === 'JAVA' ? 'Main' : 'program',
            },
        };
    } catch (err) {
        cleanupWorkDir(workDir);
        return {
            success: false,
            error: err.message,
        };
    }
}

module.exports = { compile };
