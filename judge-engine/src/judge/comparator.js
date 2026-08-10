/**
 * 输出比对
 * - 去除行首行尾空白后精确比对
 * - 未来可扩展：忽略浮点误差、忽略空格
 */
function compare(actual, expected) {
    const normalize = (str) => {
        return str
            .trim()
            .split('\n')
            .map(line => line.trimEnd())  // 保留行首缩进，仅去行尾空格
            .join('\n');
    };

    const actualNorm = normalize(actual);
    const expectedNorm = normalize(expected);

    return {
        match: actualNorm === expectedNorm,
        actual: actualNorm,
        expected: expectedNorm,
    };
}

module.exports = { compare };
