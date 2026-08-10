const mysql = require('mysql2/promise');
const { judge } = require('../src/judge/judgeService');

async function main() {
    const conn = await mysql.createConnection({
        host: 'localhost', user: 'root', password: '123456',
        database: 'intelligent_grading', charset: 'utf8mb4',
    });

    // 每难度抽几道有代表性的题
    const ids = [3, 9, 11, 17, 19, 20, 24, 27, 29, 31, 33, 34, 36, 37, 38, 40, 41, 42, 43, 45, 46, 49, 50, 51, 52];
    const langs = ['JAVA', 'CPP', 'PYTHON'];
    let pass = 0, fail = 0;

    for (const id of ids) {
        const [probs] = await conn.query('SELECT * FROM problem WHERE id = ?', [id]);
        if (!probs.length) continue;
        const p = probs[0];
        const [tests] = await conn.query('SELECT * FROM test_case WHERE problem_id = ? ORDER BY is_sample DESC', [id]);
        if (!tests.length) continue;

        const ref = JSON.parse(p.reference_code);
        const testCases = tests.map(t => ({
            input: t.input, expectedOutput: t.expected_output,
            timeLimit: t.time_limit_ms, memoryLimit: t.memory_limit_kb, isSample: t.is_sample,
        }));

        for (const lang of langs) {
            if (!ref[lang]) continue;
            try {
                const res = await judge({
                    submissionId: 0, language: lang, code: ref[lang],
                    testCases, timeLimit: 5000, memoryLimit: 131072,
                    onProgress: () => {},
                });
                if (res.status === 'ACCEPTED') {
                    pass++;
                } else {
                    fail++;
                    console.log(`FAIL #${id} ${p.title} [${lang}] -> ${res.status}`);
                    if (res.compileError) console.log('  compile:', res.compileError.slice(0, 100));
                }
            } catch (e) {
                fail++;
                console.log(`ERROR #${id} ${p.title} [${lang}] -> ${e.message}`);
            }
        }
    }

    console.log(`\n=== 验证结果 ===`);
    console.log(`通过: ${pass}, 失败: ${fail}`);
    await conn.end();
}

main().catch(e => { console.error(e); process.exit(1); });
