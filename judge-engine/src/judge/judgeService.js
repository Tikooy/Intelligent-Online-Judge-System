const { compile } = require('./compiler');
const { run } = require('./runner');
const { compare } = require('./comparator');
const { cleanupWorkDir } = require('./workdir');

/**
 * 判题主流程
 * @param {Object} params
 * @param {string} params.submissionId
 * @param {string} params.language - JAVA / CPP / PYTHON
 * @param {string} params.code - 源代码
 * @param {Array} params.testCases - [{ input, expectedOutput }]
 * @param {number} params.timeLimit - 时间限制(ms)
 * @param {number} params.memoryLimit - 内存限制(KB)
 * @param {Function} params.onProgress - 进度回调
 * @returns {Object} 判题结果
 */
async function judge({ submissionId, language, code, testCases, timeLimit, memoryLimit, onProgress }) {

    // 1. 编译
    onProgress({ type: 'COMPILING' });

    const compileResult = await compile(language, code);
    if (!compileResult.success) {
        return {
            status: 'COMPILE_ERROR',
            compileError: compileResult.error,
            totalTimeMs: 0,
            totalMemoryKb: 0,
            testCases: [],
        };
    }

    try {
    // 2. 运行测试用例（样例先行）
    const sampleCases = testCases.filter(tc => tc.isSample);
    const hiddenCases = testCases.filter(tc => !tc.isSample);
    const orderedCases = [...sampleCases, ...hiddenCases];

    onProgress({ type: 'RUNNING', totalCount: orderedCases.length });

    const results = [];
    let totalTimeMs = 0;
    let totalMemoryKb = 0;
    let finalStatus = 'ACCEPTED';

    for (let i = 0; i < orderedCases.length; i++) {
        const tc = orderedCases[i];

        const runResult = await run({
            language,
            executable: compileResult.executable,
            input: tc.input,
            timeLimit: tc.timeLimit || timeLimit,
            memoryLimit: tc.memoryLimit || memoryLimit,
        });

        const comparison = compare(runResult.stdout, tc.expectedOutput);

        let status;
        if (runResult.timedOut) {
            status = 'TIME_LIMIT_EXCEEDED';
            finalStatus = 'TIME_LIMIT_EXCEEDED';
        } else if (runResult.memoryExceeded) {
            status = 'MEMORY_LIMIT_EXCEEDED';
            finalStatus = 'MEMORY_LIMIT_EXCEEDED';
        } else if (runResult.exitCode !== 0) {
            status = 'RUNTIME_ERROR';
            finalStatus = 'RUNTIME_ERROR';
        } else if (!comparison.match) {
            status = 'WRONG_ANSWER';
            if (finalStatus === 'ACCEPTED') finalStatus = 'WRONG_ANSWER';
        } else {
            status = 'PASSED';
        }

        totalTimeMs = Math.max(totalTimeMs, runResult.timeMs || 0);
        totalMemoryKb = Math.max(totalMemoryKb, runResult.memoryKb || 0);

        const detail = {
            testCaseIndex: i + 1,
            status,
            timeMs: runResult.timeMs || 0,
            memoryKb: runResult.memoryKb || 0,
            actualOutput: runResult.stdout || '',
            errorMsg: runResult.stderr || '',
        };

        results.push(detail);

        onProgress({
            type: 'TEST_CASE_RESULT',
            testCaseIndex: i + 1,
            totalCount: orderedCases.length,
            status,
            timeMs: detail.timeMs,
        });

        // 样例不过则直接终止（不给看隐藏用例结果）
        if (tc.isSample && status !== 'PASSED') {
            break;
        }
    }

    // 填充未执行的隐藏用例
    for (let i = results.length; i < orderedCases.length; i++) {
        results.push({
            testCaseIndex: i + 1,
            status: 'SKIPPED',
            timeMs: 0,
            memoryKb: 0,
            actualOutput: '',
            errorMsg: '',
        });
    }

    return {
        status: finalStatus,
        compileError: null,
        totalTimeMs,
        totalMemoryKb,
        testCases: results,
    };
    } finally {
        // 清理编译产物目录，防止磁盘泄漏（Python 由 runner 即时清理）
        if (compileResult.executable && compileResult.executable.workDir) {
            cleanupWorkDir(compileResult.executable.workDir);
        }
    }
}

module.exports = { judge };
