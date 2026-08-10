const mysql = require('mysql2/promise');
const easy = require('./data-easy');
const medium = require('./data-medium');
const hard = require('./data-hard');

const ALL = [...easy, ...medium, ...hard];

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '123456',
        database: process.env.MYSQL_DB || 'intelligent_grading',
    });

    let problemCount = 0;
    let testCount = 0;

    try {
        for (const p of ALL) {
            const [res] = await conn.execute(
                `INSERT INTO problem (title, description, difficulty, input_format, output_format,
                                      sample_input, sample_output, reference_code, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [p.title, p.desc, p.diff, p.inFmt, p.outFmt, p.sampleIn, p.sampleOut,
                 JSON.stringify(p.code)]
            );
            const problemId = res.insertId;
            problemCount++;

            const tests = p.tests || [];
            for (let i = 0; i < tests.length; i++) {
                const [input, expected] = tests[i];
                await conn.execute(
                    `INSERT INTO test_case (problem_id, input, expected_output, time_limit_ms,
                                            memory_limit_kb, is_sample)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [problemId, input, expected, p.timeLimit || 5000, p.memLimit || 131072,
                     i === 0 ? 1 : 0]
                );
                testCount++;
            }

            console.log(`[OK] #${problemId} ${p.diff} ${p.title} (${tests.length} tests)`);
        }

        console.log(`\n=== 完成 ===`);
        console.log(`题目总数: ${problemCount}`);
        console.log(`测试用例: ${testCount}`);
        console.log(`难度分布: EASY=${ALL.filter(p => p.diff === 'EASY').length}, ` +
                    `MEDIUM=${ALL.filter(p => p.diff === 'MEDIUM').length}, ` +
                    `HARD=${ALL.filter(p => p.diff === 'HARD').length}`);
    } catch (err) {
        console.error('插入失败:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

main();
