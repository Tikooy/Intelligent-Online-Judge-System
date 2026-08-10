-- ============================================
--  智能在线判题系统 - 一键建库脚本
--  运行方式：mysql -u root -p < init.sql
--  或在 Navicat/DBeaver/IDEA 中直接执行
--
--  本文件是项目唯一的数据库初始化脚本：建库 + 建表 + 初始化数据。
--  生产环境如需平滑演进 schema，建议引入 Flyway/Liquibase。
-- ============================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS intelligent_grading
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE intelligent_grading;

-- ============================================
-- 2. 建表
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'BCrypt密码哈希',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT 'USER / ADMIN',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 题目表
CREATE TABLE IF NOT EXISTS `problem` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL COMMENT '题目标题',
    `description` TEXT NOT NULL COMMENT '题目描述',
    `difficulty` VARCHAR(20) NOT NULL COMMENT 'EASY / MEDIUM / HARD',
    `input_format` VARCHAR(500) DEFAULT NULL COMMENT '输入格式说明',
    `output_format` VARCHAR(500) DEFAULT NULL COMMENT '输出格式说明',
    `sample_input` TEXT DEFAULT NULL COMMENT '样例输入',
    `sample_output` TEXT DEFAULT NULL COMMENT '样例输出',
    `reference_code` TEXT DEFAULT NULL COMMENT '参考代码JSON',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目表';

-- 测试用例表
CREATE TABLE IF NOT EXISTS `test_case` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `problem_id` BIGINT NOT NULL COMMENT '关联题目ID',
    `input` TEXT NOT NULL COMMENT '输入数据',
    `expected_output` TEXT NOT NULL COMMENT '预期输出',
    `time_limit_ms` INT NOT NULL DEFAULT 5000 COMMENT '时间限制(ms)',
    `memory_limit_kb` INT NOT NULL DEFAULT 131072 COMMENT '内存限制(KB)',
    `is_sample` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为样例用例',
    INDEX idx_problem_id (problem_id),
    FOREIGN KEY (problem_id) REFERENCES problem(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测试用例表';

-- 提交记录表
CREATE TABLE IF NOT EXISTS `submission` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '提交用户ID',
    `problem_id` BIGINT NOT NULL COMMENT '题目ID',
    `language` VARCHAR(20) NOT NULL COMMENT 'JAVA / CPP / PYTHON',
    `code_text` MEDIUMTEXT NOT NULL COMMENT '提交的代码',
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING / ACCEPTED / WRONG_ANSWER / COMPILE_ERROR / RUNTIME_ERROR / TIME_LIMIT_EXCEEDED / MEMORY_LIMIT_EXCEEDED',
    `total_time_ms` INT DEFAULT 0 COMMENT '总耗时(ms)',
    `total_memory_kb` INT DEFAULT 0 COMMENT '总内存(KB)',
    `compile_error` TEXT DEFAULT NULL COMMENT '编译错误信息',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_problem_created (user_id, problem_id, created_at),
    INDEX idx_problem_status (problem_id, status),
    FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problem(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提交记录表';

-- 判题详情表
CREATE TABLE IF NOT EXISTS `submission_detail` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `submission_id` BIGINT NOT NULL COMMENT '关联提交ID',
    `test_case_index` INT NOT NULL COMMENT '测试点序号(从1开始)',
    `status` VARCHAR(30) NOT NULL COMMENT 'PASSED / WRONG_ANSWER / RUNTIME_ERROR / TIME_LIMIT_EXCEEDED / MEMORY_LIMIT_EXCEEDED',
    `time_ms` INT DEFAULT 0 COMMENT '该用例耗时(ms)',
    `memory_kb` INT DEFAULT 0 COMMENT '该用例内存(KB)',
    `actual_output` TEXT DEFAULT NULL COMMENT '实际输出',
    `error_msg` TEXT DEFAULT NULL COMMENT '错误信息',
    INDEX idx_submission_id (submission_id),
    FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='判题详情表';

-- ============================================
-- 3. 初始化数据
-- ============================================

-- 管理员账号：admin / admin123
INSERT IGNORE INTO `user` (`username`, `password_hash`, `nickname`, `role`) VALUES
('admin', '$2b$12$xdRZv5/V2p9GyHdrWTSQvuhkdifVDH6pOE0bqIP6QmBKs/g/Ys0My', '管理员', 'ADMIN');

-- 普通用户：test / 123456
INSERT IGNORE INTO `user` (`username`, `password_hash`, `nickname`, `role`) VALUES
('test', '$2b$12$1o.Kn76zMOfn2xZ81dUAPOo9PNdfps.GbZvREut8iVj3q4uB4RCLa', '测试用户', 'USER');

-- 示例题目：A + B Problem
INSERT IGNORE INTO `problem` (`id`, `title`, `description`, `difficulty`, `input_format`, `output_format`, `sample_input`, `sample_output`, `reference_code`) VALUES
(1, 'A + B Problem',
 '<p>输入两个整数 A 和 B，输出它们的和。</p>',
 'EASY',
 '一行，两个整数 A 和 B，以空格分隔。',
 '一个整数，即 A + B 的结果。',
 '1 2', '3',
 '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt();\\n        int b = sc.nextInt();\\n        System.out.println(a + b);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a, b;\\n    cin >> a >> b;\\n    cout << a + b << endl;\\n    return 0;\\n}","PYTHON":"a, b = map(int, input().split())\\nprint(a + b)"}');

-- A + B Problem 测试用例
INSERT IGNORE INTO `test_case` (`problem_id`, `input`, `expected_output`, `is_sample`) VALUES
(1, '1 2',      '3',    TRUE),
(1, '10 20',    '30',   FALSE),
(1, '-5 5',     '0',    FALSE),
(1, '100 200',  '300',  FALSE),
(1, '0 0',      '0',    FALSE);

-- 示例题目：判断奇偶
INSERT IGNORE INTO `problem` (`id`, `title`, `description`, `difficulty`, `input_format`, `output_format`, `sample_input`, `sample_output`, `reference_code`) VALUES
(2, '判断奇偶',
 '<p>输入一个整数 N，判断它是奇数还是偶数。</p><p>如果是偶数，输出 EVEN；如果是奇数，输出 ODD。</p>',
 'EASY',
 '一行，一个整数 N。',
 'EVEN 或 ODD。',
 '4', 'EVEN',
 '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        System.out.println(n % 2 == 0 ? \\"EVEN\\" : \\"ODD\\");\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    cout << (n % 2 == 0 ? \\"EVEN\\" : \\"ODD\\") << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nprint(\\"EVEN\\" if n % 2 == 0 else \\"ODD\\")"}');

-- 判断奇偶 测试用例
INSERT IGNORE INTO `test_case` (`problem_id`, `input`, `expected_output`, `is_sample`) VALUES
(2, '4',    'EVEN', TRUE),
(2, '7',    'ODD',  FALSE),
(2, '0',    'EVEN', FALSE),
(2, '-3',   'ODD',  FALSE),
(2, '100',  'EVEN', FALSE);



-- ============================================
-- 题库：50 道题（EASY 17 / MEDIUM 17 / HARD 16）
-- ============================================
INSERT IGNORE INTO `problem` (`id`, `title`, `description`, `difficulty`, `input_format`, `output_format`, `sample_input`, `sample_output`, `reference_code`) VALUES
(3, '两数之差', '<p>输入两个整数 A 和 B，输出 A 减 B 的结果。</p>', 'EASY', '一行，两个整数 A 和 B，以空格分隔。', '一个整数，即 A - B 的结果。', '10 3', '7', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt();\\n        int b = sc.nextInt();\\n        System.out.println(a - b);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a, b;\\n    cin >> a >> b;\\n    cout << a - b << endl;\\n    return 0;\\n}","PYTHON":"a, b = map(int, input().split())\\nprint(a - b)"}'),
(4, '三个数的平均值', '<p>输入三个整数，输出它们的平均值（向下取整）。</p>', 'EASY', '一行，三个整数，以空格分隔。', '一个整数，三个数的平均值。', '1 2 3', '2', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\\n        System.out.println((a + b + c) / 3);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a, b, c;\\n    cin >> a >> b >> c;\\n    cout << (a + b + c) / 3 << endl;\\n    return 0;\\n}","PYTHON":"a, b, c = map(int, input().split())\\nprint((a + b + c) // 3)"}'),
(5, '绝对值', '<p>输入一个整数 N，输出它的绝对值。</p>', 'EASY', '一行，一个整数 N。', '一个整数，即 |N|。', '-5', '5', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        System.out.println(Math.abs(n));\\n    }\\n}","CPP":"#include <iostream>\\n#include <cstdlib>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    cout << abs(n) << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nprint(abs(n))"}'),
(6, '判断正负', '<p>输入一个整数 N，判断它是正数、负数还是零。<br>正数输出 POSITIVE，负数输出 NEGATIVE，零输出 ZERO。</p>', 'EASY', '一行，一个整数 N。', 'POSITIVE、NEGATIVE 或 ZERO。', '5', 'POSITIVE', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        if (n > 0) System.out.println(\\"POSITIVE\\");\\n        else if (n < 0) System.out.println(\\"NEGATIVE\\");\\n        else System.out.println(\\"ZERO\\");\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    if (n > 0) cout << \\"POSITIVE\\" << endl;\\n    else if (n < 0) cout << \\"NEGATIVE\\" << endl;\\n    else cout << \\"ZERO\\" << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nif n > 0:\\n    print(\\"POSITIVE\\")\\nelif n < 0:\\n    print(\\"NEGATIVE\\")\\nelse:\\n    print(\\"ZERO\\")"}'),
(7, '判断闰年', '<p>输入一个年份 Y，判断是否为闰年。<br>闰年规则：能被 4 整除但不能被 100 整除，或者能被 400 整除。</p>', 'EASY', '一行，一个整数 Y。', '是闰年输出 YES，否则输出 NO。', '2000', 'YES', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int y = sc.nextInt();\\n        boolean leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;\\n        System.out.println(leap ? \\"YES\\" : \\"NO\\");\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int y;\\n    cin >> y;\\n    bool leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;\\n    cout << (leap ? \\"YES\\" : \\"NO\\") << endl;\\n    return 0;\\n}","PYTHON":"y = int(input())\\nprint(\\"YES\\" if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0 else \\"NO\\")"}'),
(8, '华氏度转摄氏度', '<p>输入一个华氏温度 F，输出对应的摄氏温度 C（向下取整）。<br>公式：C = (F - 32) × 5 / 9。</p>', 'EASY', '一行，一个整数 F。', '一个整数，转换后的摄氏温度。', '100', '37', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int f = sc.nextInt();\\n        System.out.println((f - 32) * 5 / 9);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int f;\\n    cin >> f;\\n    cout << (f - 32) * 5 / 9 << endl;\\n    return 0;\\n}","PYTHON":"f = int(input())\\nprint((f - 32) * 5 // 9)"}'),
(9, '1到N的累加和', '<p>输入一个整数 N，输出 1 + 2 + ... + N 的值。</p>', 'EASY', '一行，一个整数 N（1 ≤ N ≤ 100000）。', '一个整数，累加和。', '100', '5050', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        long n = sc.nextLong();\\n        System.out.println(n * (n + 1) / 2);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    long long n;\\n    cin >> n;\\n    cout << n * (n + 1) / 2 << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nprint(n * (n + 1) // 2)"}'),
(10, '平方数判断', '<p>输入一个整数 N，判断它是否为完全平方数。</p>', 'EASY', '一行，一个整数 N。', '是完全平方数输出 YES，否则输出 NO。', '16', 'YES', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int s = (int) Math.sqrt(n);\\n        System.out.println(s * s == n ? \\"YES\\" : \\"NO\\");\\n    }\\n}","CPP":"#include <iostream>\\n#include <cmath>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int s = (int) sqrt(n);\\n    cout << (s * s == n ? \\"YES\\" : \\"NO\\") << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\ns = int(n ** 0.5)\\nprint(\\"YES\\" if s * s == n else \\"NO\\")"}'),
(11, '两个数的最大值', '<p>输入两个整数，输出较大的那个数。</p>', 'EASY', '一行，两个整数 A 和 B。', '一个整数，两数中的最大值。', '5 9', '9', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt(), b = sc.nextInt();\\n        System.out.println(Math.max(a, b));\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int a, b;\\n    cin >> a >> b;\\n    cout << max(a, b) << endl;\\n    return 0;\\n}","PYTHON":"a, b = map(int, input().split())\\nprint(max(a, b))"}'),
(12, '字符ASCII码', '<p>输入一个小写字母，输出它的 ASCII 码值。</p>', 'EASY', '一行，一个小写字母。', '一个整数，该字母的 ASCII 码。', 'a', '97', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        char c = sc.next().charAt(0);\\n        System.out.println((int) c);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    char c;\\n    cin >> c;\\n    cout << (int) c << endl;\\n    return 0;\\n}","PYTHON":"print(ord(input()))"}'),
(13, '交换两个数', '<p>输入两个整数 A 和 B，交换它们的顺序后输出。</p>', 'EASY', '一行，两个整数 A 和 B。', '一行，先输出 B 再输出 A，空格分隔。', '3 7', '7 3', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt(), b = sc.nextInt();\\n        System.out.println(b + \\" \\" + a);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a, b;\\n    cin >> a >> b;\\n    cout << b << \\" \\" << a << endl;\\n    return 0;\\n}","PYTHON":"a, b = map(int, input().split())\\nprint(b, a)"}'),
(14, '数字反转（两位数）', '<p>输入一个两位数 N，输出反转后的数。<br>例如 45 反转后为 54，10 反转后为 1。</p>', 'EASY', '一行，一个两位数 N。', '一个整数，反转后的数。', '45', '54', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int a = n / 10, b = n % 10;\\n        System.out.println(b * 10 + a);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int a = n / 10, b = n % 10;\\n    cout << b * 10 + a << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nprint(int(str(n)[::-1]))"}'),
(15, '商和余数', '<p>输入两个正整数 A 和 B，输出 A 除以 B 的商和余数。</p>', 'EASY', '一行，两个正整数 A 和 B。', '一行，商和余数，以空格分隔。', '17 5', '3 2', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt(), b = sc.nextInt();\\n        System.out.println(a / b + \\" \\" + a % b);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a, b;\\n    cin >> a >> b;\\n    cout << a / b << \\" \\" << a % b << endl;\\n    return 0;\\n}","PYTHON":"a, b = map(int, input().split())\\nprint(a // b, a % b)"}'),
(16, '三个数中最大的', '<p>输入三个整数，输出其中最大的数。</p>', 'EASY', '一行，三个整数，以空格分隔。', '一个整数，最大值。', '1 5 3', '5', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\\n        System.out.println(Math.max(a, Math.max(b, c)));\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int a, b, c;\\n    cin >> a >> b >> c;\\n    cout << max(a, max(b, c)) << endl;\\n    return 0;\\n}","PYTHON":"a, b, c = map(int, input().split())\\nprint(max(a, b, c))"}'),
(17, '字符串长度', '<p>输入一个字符串，输出它的长度。</p>', 'EASY', '一行，一个字符串。', '一个整数，字符串长度。', 'hello', '5', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String s = sc.nextLine();\\n        System.out.println(s.length());\\n    }\\n}","CPP":"#include <iostream>\\n#include <string>\\nusing namespace std;\\n\\nint main() {\\n    string s;\\n    getline(cin, s);\\n    cout << s.length() << endl;\\n    return 0;\\n}","PYTHON":"print(len(input()))"}'),
(18, '小写转大写', '<p>输入一个小写字母，输出对应的大写字母。</p>', 'EASY', '一行，一个小写字母。', '一个字符，对应的大写字母。', 'a', 'A', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        char c = sc.next().charAt(0);\\n        System.out.println((char) (c - 32));\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    char c;\\n    cin >> c;\\n    cout << (char) (c - 32) << endl;\\n    return 0;\\n}","PYTHON":"print(input().upper())"}'),
(19, '简单密码', '<p>输入一个小写字母，输出字母表中它后面的一个字母。<br>如果输入是 z，则输出 a。</p>', 'EASY', '一行，一个小写字母。', '一个字符，后移一位后的字母。', 'a', 'b', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        char c = sc.next().charAt(0);\\n        System.out.println(c == ''z'' ? ''a'' : (char) (c + 1));\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    char c;\\n    cin >> c;\\n    cout << (c == ''z'' ? ''a'' : (char) (c + 1)) << endl;\\n    return 0;\\n}","PYTHON":"c = input()\\nprint(''a'' if c == ''z'' else chr(ord(c) + 1))"}'),
(20, '回文数判断', '<p>输入一个正整数 N，判断它是否为回文数。<br>回文数是指正序和倒序读都相同的数。</p>', 'MEDIUM', '一行，一个正整数 N。', '是回文数输出 YES，否则输出 NO。', '12321', 'YES', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int rev = 0, x = n;\\n        while (x > 0) { rev = rev * 10 + x % 10; x /= 10; }\\n        System.out.println(rev == n ? \\"YES\\" : \\"NO\\");\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int rev = 0, x = n;\\n    while (x > 0) { rev = rev * 10 + x % 10; x /= 10; }\\n    cout << (rev == n ? \\"YES\\" : \\"NO\\") << endl;\\n    return 0;\\n}","PYTHON":"n = input()\\nprint(\\"YES\\" if n == n[::-1] else \\"NO\\")"}'),
(21, '最大公约数', '<p>输入两个正整数 A 和 B，输出它们的最大公约数。</p>', 'MEDIUM', '一行，两个正整数 A 和 B。', '一个整数，A 和 B 的最大公约数。', '12 18', '6', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt(), b = sc.nextInt();\\n        while (b != 0) { int t = a % b; a = b; b = t; }\\n        System.out.println(a);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a, b;\\n    cin >> a >> b;\\n    while (b != 0) { int t = a % b; a = b; b = t; }\\n    cout << a << endl;\\n    return 0;\\n}","PYTHON":"import math\\na, b = map(int, input().split())\\nprint(math.gcd(a, b))"}'),
(22, '最小公倍数', '<p>输入两个正整数 A 和 B，输出它们的最小公倍数。</p>', 'MEDIUM', '一行，两个正整数 A 和 B。', '一个整数，A 和 B 的最小公倍数。', '4 6', '12', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    static int gcd(int a, int b) { while (b != 0) { int t = a % b; a = b; b = t; } return a; }\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int a = sc.nextInt(), b = sc.nextInt();\\n        long lcm = (long) a / gcd(a, b) * b;\\n        System.out.println(lcm);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    long long a, b;\\n    cin >> a >> b;\\n    long long x = a, y = b;\\n    while (y != 0) { long long t = x % y; x = y; y = t; }\\n    cout << a / x * b << endl;\\n    return 0;\\n}","PYTHON":"import math\\na, b = map(int, input().split())\\nprint(a * b // math.gcd(a, b))"}'),
(23, '各位数字之和', '<p>输入一个正整数 N，输出它各位数字之和。</p>', 'MEDIUM', '一行，一个正整数 N。', '一个整数，各位数字之和。', '1234', '10', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int s = 0;\\n        while (n > 0) { s += n % 10; n /= 10; }\\n        System.out.println(s);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int s = 0;\\n    while (n > 0) { s += n % 10; n /= 10; }\\n    cout << s << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nprint(sum(int(c) for c in str(n)))"}'),
(24, '十进制转二进制', '<p>输入一个非负整数 N，输出它的二进制表示。</p>', 'MEDIUM', '一行，一个非负整数 N。', '一个字符串，N 的二进制表示。', '10', '1010', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        if (n == 0) { System.out.println(0); return; }\\n        StringBuilder sb = new StringBuilder();\\n        while (n > 0) { sb.append(n % 2); n /= 2; }\\n        System.out.println(sb.reverse().toString());\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    if (n == 0) { cout << 0 << endl; return 0; }\\n    string s;\\n    while (n > 0) { s += (char)(''0'' + n % 2); n /= 2; }\\n    for (int i = s.size() - 1; i >= 0; i--) cout << s[i];\\n    cout << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nprint(bin(n)[2:])"}'),
(25, '数组排序', '<p>输入 N 个整数，将它们按升序排序后输出。</p>', 'MEDIUM', '第一行一个整数 N，第二行 N 个整数，以空格分隔。', '一行，排序后的 N 个整数，以空格分隔。', '5\n5 2 8 1 9', '1 2 5 8 9', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int[] a = new int[n];\\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\\n        Arrays.sort(a);\\n        for (int i = 0; i < n; i++) System.out.print(a[i] + (i == n - 1 ? \\"\\" : \\" \\"));\\n        System.out.println();\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int a[1000];\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    sort(a, a + n);\\n    for (int i = 0; i < n; i++) cout << a[i] << (i == n - 1 ? \\"\\" : \\" \\");\\n    cout << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\na = list(map(int, input().split()))\\na.sort()\\nprint(*a)"}'),
(26, '回文字符串', '<p>输入一个字符串，判断它是否为回文（正序和倒序相同）。</p>', 'MEDIUM', '一行，一个不含空格的字符串。', '是回文输出 YES，否则输出 NO。', 'level', 'YES', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String s = sc.nextLine();\\n        String r = new StringBuilder(s).reverse().toString();\\n        System.out.println(s.equals(r) ? \\"YES\\" : \\"NO\\");\\n    }\\n}","CPP":"#include <iostream>\\n#include <string>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    string s, r;\\n    cin >> s;\\n    r = s;\\n    reverse(r.begin(), r.end());\\n    cout << (s == r ? \\"YES\\" : \\"NO\\") << endl;\\n    return 0;\\n}","PYTHON":"s = input()\\nprint(\\"YES\\" if s == s[::-1] else \\"NO\\")"}'),
(27, '斐波那契数列', '<p>斐波那契数列定义：F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)。<br>输入 N，输出 F(N)。</p>', 'MEDIUM', '一行，一个非负整数 N（0 ≤ N ≤ 40）。', '一个整数，第 N 项的值。', '10', '55', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        long a = 0, b = 1;\\n        for (int i = 0; i < n; i++) { long t = a + b; a = b; b = t; }\\n        System.out.println(a);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    long long a = 0, b = 1;\\n    for (int i = 0; i < n; i++) { long long t = a + b; a = b; b = t; }\\n    cout << a << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\na, b = 0, 1\\nfor _ in range(n): a, b = b, a + b\\nprint(a)"}'),
(28, '阶乘', '<p>输入一个正整数 N，输出 N 的阶乘（N!）。</p>', 'MEDIUM', '一行，一个正整数 N（1 ≤ N ≤ 20）。', '一个整数，N! 的值。', '5', '120', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        long f = 1;\\n        for (int i = 2; i <= n; i++) f *= i;\\n        System.out.println(f);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    long long f = 1;\\n    for (int i = 2; i <= n; i++) f *= i;\\n    cout << f << endl;\\n    return 0;\\n}","PYTHON":"import math\\nn = int(input())\\nprint(math.factorial(n))"}'),
(29, '二分查找', '<p>给定一个升序数组和目标值，使用二分查找返回目标值的下标（从 0 开始），找不到返回 -1。</p>', 'MEDIUM', '第一行 N，第二行 N 个升序整数，第三行目标值 target。', '一个整数，目标值的下标，找不到则输出 -1。', '5\n1 3 5 7 9\n5', '2', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int[] a = new int[n];\\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\\n        int t = sc.nextInt();\\n        int lo = 0, hi = n - 1, ans = -1;\\n        while (lo <= hi) {\\n            int mid = (lo + hi) / 2;\\n            if (a[mid] == t) { ans = mid; break; }\\n            else if (a[mid] < t) lo = mid + 1;\\n            else hi = mid - 1;\\n        }\\n        System.out.println(ans);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int a[1000];\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    int t;\\n    cin >> t;\\n    int lo = 0, hi = n - 1, ans = -1;\\n    while (lo <= hi) {\\n        int mid = (lo + hi) / 2;\\n        if (a[mid] == t) { ans = mid; break; }\\n        else if (a[mid] < t) lo = mid + 1;\\n        else hi = mid - 1;\\n    }\\n    cout << ans << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\na = list(map(int, input().split()))\\nt = int(input())\\nlo, hi, ans = 0, n - 1, -1\\nwhile lo <= hi:\\n    mid = (lo + hi) // 2\\n    if a[mid] == t: ans = mid; break\\n    elif a[mid] < t: lo = mid + 1\\n    else: hi = mid - 1\\nprint(ans)"}'),
(30, '数组去重', '<p>输入 N 个整数，去除重复元素后输出（保留首次出现的顺序）。</p>', 'MEDIUM', '第一行 N，第二行 N 个整数。', '一行，去重后的整数，以空格分隔。', '5\n1 2 1 3 2', '1 2 3', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        LinkedHashSet<Integer> set = new LinkedHashSet<>();\\n        for (int i = 0; i < n; i++) set.add(sc.nextInt());\\n        StringBuilder sb = new StringBuilder();\\n        for (int x : set) sb.append(x).append(\\" \\");\\n        System.out.println(sb.toString().trim());\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int a[1000];\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    for (int i = 0; i < n; i++) {\\n        bool dup = false;\\n        for (int j = 0; j < i; j++) if (a[j] == a[i]) { dup = true; break; }\\n        if (!dup) cout << a[i] << \\" \\";\\n    }\\n    cout << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\na = list(map(int, input().split()))\\nseen = []\\nfor x in a:\\n    if x not in seen: seen.append(x)\\nprint(*seen)"}'),
(31, '矩阵转置', '<p>给定一个 R 行 C 列的矩阵，输出它的转置矩阵（C 行 R 列）。</p>', 'MEDIUM', '第一行两个整数 R 和 C，接下来 R 行每行 C 个整数。', 'C 行，每行 R 个整数，即转置后的矩阵。', '2 3\n1 2 3\n4 5 6', '1 4\n2 5\n3 6', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int r = sc.nextInt(), c = sc.nextInt();\\n        int[][] m = new int[r][c];\\n        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) m[i][j] = sc.nextInt();\\n        for (int j = 0; j < c; j++) {\\n            for (int i = 0; i < r; i++) System.out.print(m[i][j] + (i == r - 1 ? \\"\\" : \\" \\"));\\n            System.out.println();\\n        }\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int r, c;\\n    cin >> r >> c;\\n    int m[100][100];\\n    for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) cin >> m[i][j];\\n    for (int j = 0; j < c; j++) {\\n        for (int i = 0; i < r; i++) cout << m[i][j] << (i == r - 1 ? \\"\\" : \\" \\");\\n        cout << endl;\\n    }\\n    return 0;\\n}","PYTHON":"r, c = map(int, input().split())\\nm = [list(map(int, input().split())) for _ in range(r)]\\nfor j in range(c):\\n    print(*[m[i][j] for i in range(r)])"}'),
(32, '字符串反转', '<p>输入一个字符串，输出反转后的字符串。</p>', 'MEDIUM', '一行，一个字符串。', '一行，反转后的字符串。', 'hello', 'olleh', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        System.out.println(new StringBuilder(sc.nextLine()).reverse().toString());\\n    }\\n}","CPP":"#include <iostream>\\n#include <string>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    string s;\\n    cin >> s;\\n    reverse(s.begin(), s.end());\\n    cout << s << endl;\\n    return 0;\\n}","PYTHON":"print(input()[::-1])"}'),
(33, '素数判定', '<p>输入一个整数 N，判断它是否为素数。</p>', 'MEDIUM', '一行，一个正整数 N（2 ≤ N ≤ 1000000）。', '是素数输出 YES，否则输出 NO。', '17', 'YES', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        boolean prime = n >= 2;\\n        for (int i = 2; (long) i * i <= n; i++) {\\n            if (n % i == 0) { prime = false; break; }\\n        }\\n        System.out.println(prime ? \\"YES\\" : \\"NO\\");\\n    }\\n}","CPP":"#include <iostream>\\n#include <cmath>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    bool prime = n >= 2;\\n    for (int i = 2; (long long) i * i <= n; i++) {\\n        if (n % i == 0) { prime = false; break; }\\n    }\\n    cout << (prime ? \\"YES\\" : \\"NO\\") << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nprime = n >= 2\\nfor i in range(2, int(n ** 0.5) + 1):\\n    if n % i == 0: prime = False; break\\nprint(\\"YES\\" if prime else \\"NO\\")"}'),
(34, '统计单词数', '<p>输入一行字符串（可能包含多个连续空格），统计其中单词的个数。</p>', 'MEDIUM', '一行，一个字符串。', '一个整数，单词个数。', 'hello world', '2', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String s = sc.nextLine().trim();\\n        if (s.isEmpty()) System.out.println(0);\\n        else System.out.println(s.split(\\"\\\\\\\\s+\\").length);\\n    }\\n}","CPP":"#include <iostream>\\n#include <sstream>\\n#include <string>\\nusing namespace std;\\n\\nint main() {\\n    string line, w;\\n    getline(cin, line);\\n    stringstream ss(line);\\n    int cnt = 0;\\n    while (ss >> w) cnt++;\\n    cout << cnt << endl;\\n    return 0;\\n}","PYTHON":"s = input().strip()\\nprint(len(s.split()) if s else 0)"}'),
(35, '杨辉三角', '<p>输出前 N 行的杨辉三角。每行的第一个和最后一个数为 1，其余数为上方两数之和。</p>', 'MEDIUM', '一行，一个正整数 N（1 ≤ N ≤ 10）。', 'N 行，每行若干整数，以空格分隔。', '4', '1\n1 1\n1 2 1\n1 3 3 1', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int[][] t = new int[n][n];\\n        for (int i = 0; i < n; i++) {\\n            t[i][0] = 1; t[i][i] = 1;\\n            for (int j = 1; j < i; j++) t[i][j] = t[i-1][j-1] + t[i-1][j];\\n            for (int j = 0; j <= i; j++) System.out.print(t[i][j] + (j == i ? \\"\\" : \\" \\"));\\n            System.out.println();\\n        }\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int t[10][10] = {0};\\n    for (int i = 0; i < n; i++) {\\n        t[i][0] = 1; t[i][i] = 1;\\n        for (int j = 1; j < i; j++) t[i][j] = t[i-1][j-1] + t[i-1][j];\\n        for (int j = 0; j <= i; j++) cout << t[i][j] << (j == i ? \\"\\" : \\" \\");\\n        cout << endl;\\n    }\\n    return 0;\\n}","PYTHON":"n = int(input())\\nt = [[0] * n for _ in range(n)]\\nfor i in range(n):\\n    t[i][0] = t[i][i] = 1\\n    for j in range(1, i): t[i][j] = t[i-1][j-1] + t[i-1][j]\\n    print(*[t[i][j] for j in range(i + 1)])"}'),
(36, '冒泡排序交换次数', '<p>对 N 个整数进行冒泡排序，输出排序过程中的交换次数。</p>', 'MEDIUM', '第一行 N，第二行 N 个整数。', '一个整数，冒泡排序的交换次数。', '4\n4 3 2 1', '6', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int[] a = new int[n];\\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\\n        int cnt = 0;\\n        for (int i = 0; i < n - 1; i++) {\\n            for (int j = 0; j < n - 1 - i; j++) {\\n                if (a[j] > a[j+1]) { int t = a[j]; a[j] = a[j+1]; a[j+1] = t; cnt++; }\\n            }\\n        }\\n        System.out.println(cnt);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int a[1000];\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    int cnt = 0;\\n    for (int i = 0; i < n - 1; i++)\\n        for (int j = 0; j < n - 1 - i; j++)\\n            if (a[j] > a[j+1]) { int t = a[j]; a[j] = a[j+1]; a[j+1] = t; cnt++; }\\n    cout << cnt << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\na = list(map(int, input().split()))\\ncnt = 0\\nfor i in range(n - 1):\\n    for j in range(n - 1 - i):\\n        if a[j] > a[j+1]: a[j], a[j+1] = a[j+1], a[j]; cnt += 1\\nprint(cnt)"}'),
(37, '最长公共子序列', '<p>给定两个字符串，求它们的最长公共子序列（LCS）的长度。<br>子序列不要求连续，但保持相对顺序。</p>', 'HARD', '两行，每行一个字符串。', '一个整数，LCS 的长度。', 'abcde\nace', '3', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String a = sc.nextLine(), b = sc.nextLine();\\n        int n = a.length(), m = b.length();\\n        int[][] dp = new int[n+1][m+1];\\n        for (int i = 1; i <= n; i++)\\n            for (int j = 1; j <= m; j++)\\n                dp[i][j] = a.charAt(i-1) == b.charAt(j-1)\\n                    ? dp[i-1][j-1] + 1\\n                    : Math.max(dp[i-1][j], dp[i][j-1]);\\n        System.out.println(dp[n][m]);\\n    }\\n}","CPP":"#include <iostream>\\n#include <string>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    string a, b;\\n    getline(cin, a); getline(cin, b);\\n    int n = a.size(), m = b.size();\\n    int dp[1001][1001] = {0};\\n    for (int i = 1; i <= n; i++)\\n        for (int j = 1; j <= m; j++)\\n            dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);\\n    cout << dp[n][m] << endl;\\n    return 0;\\n}","PYTHON":"a = input().strip()\\nb = input().strip()\\nn, m = len(a), len(b)\\ndp = [[0] * (m+1) for _ in range(n+1)]\\nfor i in range(1, n+1):\\n    for j in range(1, m+1):\\n        dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])\\nprint(dp[n][m])"}'),
(38, '0-1背包', '<p>有 N 件物品和一个容量为 C 的背包。每件物品有重量和价值，求在不超过背包容量的前提下能装下的最大价值。</p>', 'HARD', '第一行两个整数 N 和 C，接下来 N 行每行两个整数 w 和 v（重量和价值）。', '一个整数，最大价值。', '3 5\n2 3\n1 2\n3 4', '7', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt(), c = sc.nextInt();\\n        int[] w = new int[n], v = new int[n];\\n        for (int i = 0; i < n; i++) { w[i] = sc.nextInt(); v[i] = sc.nextInt(); }\\n        int[] dp = new int[c+1];\\n        for (int i = 0; i < n; i++)\\n            for (int j = c; j >= w[i]; j--)\\n                dp[j] = Math.max(dp[j], dp[j-w[i]] + v[i]);\\n        System.out.println(dp[c]);\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int n, c;\\n    cin >> n >> c;\\n    int dp[1001] = {0};\\n    for (int i = 0; i < n; i++) {\\n        int w, v;\\n        cin >> w >> v;\\n        for (int j = c; j >= w; j--) dp[j] = max(dp[j], dp[j-w] + v);\\n    }\\n    cout << dp[c] << endl;\\n    return 0;\\n}","PYTHON":"n, c = map(int, input().split())\\ndp = [0] * (c + 1)\\nfor _ in range(n):\\n    w, v = map(int, input().split())\\n    for j in range(c, w - 1, -1):\\n        dp[j] = max(dp[j], dp[j - w] + v)\\nprint(dp[c])"}'),
(39, '最长递增子序列', '<p>给定一个整数序列，求最长递增子序列（LIS）的长度。<br>子序列中的元素保持相对顺序且严格递增。</p>', 'HARD', '第一行 N，第二行 N 个整数。', '一个整数，LIS 的长度。', '6\n1 7 2 8 3 9', '4', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int[] a = new int[n];\\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\\n        int[] dp = new int[n];\\n        int ans = 0;\\n        Arrays.fill(dp, 1);\\n        for (int i = 0; i < n; i++) {\\n            for (int j = 0; j < i; j++)\\n                if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\\n            ans = Math.max(ans, dp[i]);\\n        }\\n        System.out.println(ans);\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    int a[1000];\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    int dp[1000], ans = 0;\\n    fill(dp, dp + n, 1);\\n    for (int i = 0; i < n; i++) {\\n        for (int j = 0; j < i; j++)\\n            if (a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);\\n        ans = max(ans, dp[i]);\\n    }\\n    cout << ans << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\na = list(map(int, input().split()))\\ndp = [1] * n\\nans = 1\\nfor i in range(n):\\n    for j in range(i):\\n        if a[j] < a[i]: dp[i] = max(dp[i], dp[j] + 1)\\n    ans = max(ans, dp[i])\\nprint(ans)"}'),
(40, '大数加法', '<p>输入两个超大整数（可能超过 64 位整数范围），输出它们的和。</p>', 'HARD', '两行，每行一个非负整数。', '一行，两个数之和。', '99999999999999999999\n1', '100000000000000000000', '{"JAVA":"import java.util.*;\\nimport java.math.BigInteger;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        BigInteger a = new BigInteger(sc.nextLine());\\n        BigInteger b = new BigInteger(sc.nextLine());\\n        System.out.println(a.add(b));\\n    }\\n}","CPP":"#include <iostream>\\n#include <string>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    string a, b;\\n    cin >> a >> b;\\n    int i = a.size() - 1, j = b.size() - 1, carry = 0;\\n    string res;\\n    while (i >= 0 || j >= 0 || carry) {\\n        int s = carry;\\n        if (i >= 0) s += a[i--] - ''0'';\\n        if (j >= 0) s += b[j--] - ''0'';\\n        res += (char)(''0'' + s % 10);\\n        carry = s / 10;\\n    }\\n    reverse(res.begin(), res.end());\\n    cout << res << endl;\\n    return 0;\\n}","PYTHON":"a = input().strip()\\nb = input().strip()\\nprint(int(a) + int(b))"}'),
(41, 'N皇后问题', '<p>在 N×N 的棋盘上放置 N 个皇后，使它们互不攻击（不同行、不同列、不同对角线）。输出方案总数。</p>', 'HARD', '一行，一个正整数 N（1 ≤ N ≤ 10）。', '一个整数，方案数。', '8', '92', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    static int n, cnt = 0;\\n    static boolean[] col, d1, d2;\\n    static void dfs(int row) {\\n        if (row == n) { cnt++; return; }\\n        for (int c = 0; c < n; c++) {\\n            if (col[c] || d1[row+c] || d2[row-c+n]) continue;\\n            col[c] = d1[row+c] = d2[row-c+n] = true;\\n            dfs(row+1);\\n            col[c] = d1[row+c] = d2[row-c+n] = false;\\n        }\\n    }\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        n = sc.nextInt();\\n        col = new boolean[n]; d1 = new boolean[2*n]; d2 = new boolean[2*n];\\n        dfs(0);\\n        System.out.println(cnt);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint n, cnt = 0;\\nbool col[11], d1[21], d2[21];\\n\\nvoid dfs(int row) {\\n    if (row == n) { cnt++; return; }\\n    for (int c = 0; c < n; c++) {\\n        if (col[c] || d1[row+c] || d2[row-c+n]) continue;\\n        col[c] = d1[row+c] = d2[row-c+n] = true;\\n        dfs(row+1);\\n        col[c] = d1[row+c] = d2[row-c+n] = false;\\n    }\\n}\\n\\nint main() {\\n    cin >> n;\\n    dfs(0);\\n    cout << cnt << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\ncol = [False] * n\\nd1 = [False] * (2 * n)\\nd2 = [False] * (2 * n)\\ncnt = 0\\n\\ndef dfs(row):\\n    global cnt\\n    if row == n:\\n        cnt += 1\\n        return\\n    for c in range(n):\\n        if col[c] or d1[row+c] or d2[row-c+n]: continue\\n        col[c] = d1[row+c] = d2[row-c+n] = True\\n        dfs(row + 1)\\n        col[c] = d1[row+c] = d2[row-c+n] = False\\n\\ndfs(0)\\nprint(cnt)"}'),
(42, '表达式求值', '<p>给定一个只含数字和 +、-、* 运算符的表达式，求它的值。<br>运算符按数学优先级计算（先乘后加减）。</p>', 'HARD', '一行，一个不含括号的表达式。', '一个整数，表达式的结果。', '3+5*2', '13', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String s = sc.nextLine();\\n        Deque<Long> st = new ArrayDeque<>();\\n        long num = 0; char op = ''+'';\\n        for (int i = 0; i <= s.length(); i++) {\\n            char c = i < s.length() ? s.charAt(i) : ''+'';\\n            if (Character.isDigit(c)) num = num * 10 + (c - ''0'');\\n            else {\\n                if (op == ''+'') st.push(num);\\n                else if (op == ''-'') st.push(-num);\\n                else if (op == ''*'') st.push(st.pop() * num);\\n                op = c; num = 0;\\n            }\\n        }\\n        long ans = 0;\\n        while (!st.isEmpty()) ans += st.pop();\\n        System.out.println(ans);\\n    }\\n}","CPP":"#include <iostream>\\n#include <stack>\\n#include <cctype>\\nusing namespace std;\\n\\nint main() {\\n    string s;\\n    cin >> s;\\n    stack<long long> st;\\n    long long num = 0;\\n    char op = ''+'';\\n    for (int i = 0; i <= (int)s.size(); i++) {\\n        char c = i < (int)s.size() ? s[i] : ''+'';\\n        if (isdigit(c)) num = num * 10 + (c - ''0'');\\n        else {\\n            if (op == ''+'') st.push(num);\\n            else if (op == ''-'') st.push(-num);\\n            else if (op == ''*'') { long long t = st.top(); st.pop(); st.push(t * num); }\\n            op = c; num = 0;\\n        }\\n    }\\n    long long ans = 0;\\n    while (!st.empty()) { ans += st.top(); st.pop(); }\\n    cout << ans << endl;\\n    return 0;\\n}","PYTHON":"s = input().strip()\\nst = []\\nnum = 0\\nop = ''+''\\nfor c in s + ''+'':\\n    if c.isdigit():\\n        num = num * 10 + int(c)\\n    else:\\n        if op == ''+'': st.append(num)\\n        elif op == ''-'': st.append(-num)\\n        elif op == ''*'': st.append(st.pop() * num)\\n        op = c\\n        num = 0\\nprint(sum(st))"}'),
(43, '约瑟夫环', '<p>N 个人围成一圈，从第 1 个人开始报数，报到 K 的人出局，然后从下一个人重新报数。<br>求最后剩下的人的编号。</p>', 'HARD', '一行，两个整数 N 和 K。', '一个整数，最后剩下的人的编号（从 1 开始）。', '5 2', '3', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt(), k = sc.nextInt();\\n        List<Integer> list = new ArrayList<>();\\n        for (int i = 1; i <= n; i++) list.add(i);\\n        int idx = 0;\\n        while (list.size() > 1) {\\n            idx = (idx + k - 1) % list.size();\\n            list.remove(idx);\\n        }\\n        System.out.println(list.get(0));\\n    }\\n}","CPP":"#include <iostream>\\n#include <vector>\\nusing namespace std;\\n\\nint main() {\\n    int n, k;\\n    cin >> n >> k;\\n    vector<int> v(n);\\n    for (int i = 0; i < n; i++) v[i] = i + 1;\\n    int idx = 0;\\n    while (v.size() > 1) {\\n        idx = (idx + k - 1) % v.size();\\n        v.erase(v.begin() + idx);\\n    }\\n    cout << v[0] << endl;\\n    return 0;\\n}","PYTHON":"n, k = map(int, input().split())\\npeople = list(range(1, n + 1))\\nidx = 0\\nwhile len(people) > 1:\\n    idx = (idx + k - 1) % len(people)\\n    people.pop(idx)\\nprint(people[0])"}'),
(44, '合并区间', '<p>给定 N 个区间 [l, r]，将重叠或相邻的区间合并，输出合并后的区间个数。</p>', 'HARD', '第一行 N，接下来 N 行每行两个整数 l 和 r。', '一个整数，合并后的区间个数。', '3\n1 3\n2 6\n8 10', '2', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        int[][] a = new int[n][2];\\n        for (int i = 0; i < n; i++) { a[i][0] = sc.nextInt(); a[i][1] = sc.nextInt(); }\\n        Arrays.sort(a, (x, y) -> x[0] - y[0]);\\n        int cnt = 0, curR = Integer.MIN_VALUE;\\n        for (int i = 0; i < n; i++) {\\n            if (a[i][0] > curR) { cnt++; curR = a[i][1]; }\\n            else curR = Math.max(curR, a[i][1]);\\n        }\\n        System.out.println(cnt);\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    pair<int,int> a[1000];\\n    for (int i = 0; i < n; i++) cin >> a[i].first >> a[i].second;\\n    sort(a, a + n);\\n    int cnt = 0, curR = -1e9;\\n    for (int i = 0; i < n; i++) {\\n        if (a[i].first > curR) { cnt++; curR = a[i].second; }\\n        else curR = max(curR, a[i].second);\\n    }\\n    cout << cnt << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\na = [list(map(int, input().split())) for _ in range(n)]\\na.sort()\\ncnt = 0\\ncurR = -10**9\\nfor l, r in a:\\n    if l > curR: cnt += 1; curR = r\\n    else: curR = max(curR, r)\\nprint(cnt)"}'),
(45, '滑动窗口最大值', '<p>给定一个数组和窗口大小 K，输出每个长度为 K 的窗口中的最大值。</p>', 'HARD', '第一行两个整数 N 和 K，第二行 N 个整数。', '一行，共 N-K+1 个整数，即每个窗口的最大值。', '8 3\n1 3 -1 -3 5 3 6 7', '3 3 5 5 6 7', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt(), k = sc.nextInt();\\n        int[] a = new int[n];\\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\\n        Deque<Integer> dq = new ArrayDeque<>();\\n        for (int i = 0; i < n; i++) {\\n            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();\\n            dq.addLast(i);\\n            if (dq.peekFirst() <= i - k) dq.pollFirst();\\n            if (i >= k - 1) System.out.print(a[dq.peekFirst()] + (i == n - 1 ? \\"\\" : \\" \\"));\\n        }\\n        System.out.println();\\n    }\\n}","CPP":"#include <iostream>\\n#include <deque>\\nusing namespace std;\\n\\nint main() {\\n    int n, k;\\n    cin >> n >> k;\\n    int a[100000];\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    deque<int> dq;\\n    for (int i = 0; i < n; i++) {\\n        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();\\n        dq.push_back(i);\\n        if (dq.front() <= i - k) dq.pop_front();\\n        if (i >= k - 1) cout << a[dq.front()] << (i == n - 1 ? \\"\\" : \\" \\");\\n    }\\n    cout << endl;\\n    return 0;\\n}","PYTHON":"from collections import deque\\nn, k = map(int, input().split())\\na = list(map(int, input().split()))\\ndq = deque()\\nans = []\\nfor i in range(n):\\n    while dq and a[dq[-1]] <= a[i]: dq.pop()\\n    dq.append(i)\\n    if dq[0] <= i - k: dq.popleft()\\n    if i >= k - 1: ans.append(str(a[dq[0]]))\\nprint(\\" \\".join(ans))"}'),
(46, '爬楼梯', '<p>爬一个有 N 阶的楼梯，每次可以爬 1 阶或 2 阶，问有多少种不同的方法爬到顶。</p>', 'HARD', '一行，一个正整数 N（1 ≤ N ≤ 50）。', '一个整数，方法总数。', '4', '5', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        if (n == 1) { System.out.println(1); return; }\\n        long a = 1, b = 2;\\n        for (int i = 3; i <= n; i++) { long t = a + b; a = b; b = t; }\\n        System.out.println(b);\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    if (n == 1) { cout << 1 << endl; return 0; }\\n    long long a = 1, b = 2;\\n    for (int i = 3; i <= n; i++) { long long t = a + b; a = b; b = t; }\\n    cout << b << endl;\\n    return 0;\\n}","PYTHON":"n = int(input())\\nif n == 1: print(1); exit()\\na, b = 1, 2\\nfor _ in range(3, n + 1): a, b = b, a + b\\nprint(b)"}'),
(47, '判断有向图是否有环', '<p>给定一个有向图，判断是否存在环。<br>存在环输出 CYCLE，否则输出 ACYCLIC。</p>', 'HARD', '第一行两个整数 N 和 M（节点编号 0 到 N-1），接下来 M 行每行两个整数 u 和 v（表示有向边 u→v）。', 'CYCLE 或 ACYCLIC。', '4 4\n0 1\n1 2\n2 3\n3 0', 'CYCLE', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt(), m = sc.nextInt();\\n        List<List<Integer>> g = new ArrayList<>();\\n        for (int i = 0; i < n; i++) g.add(new ArrayList<>());\\n        int[] indeg = new int[n];\\n        for (int i = 0; i < m; i++) {\\n            int u = sc.nextInt(), v = sc.nextInt();\\n            g.get(u).add(v); indeg[v]++;\\n        }\\n        Queue<Integer> q = new LinkedList<>();\\n        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);\\n        int cnt = 0;\\n        while (!q.isEmpty()) {\\n            int u = q.poll(); cnt++;\\n            for (int v : g.get(u)) if (--indeg[v] == 0) q.add(v);\\n        }\\n        System.out.println(cnt == n ? \\"ACYCLIC\\" : \\"CYCLE\\");\\n    }\\n}","CPP":"#include <iostream>\\n#include <vector>\\n#include <queue>\\nusing namespace std;\\n\\nint main() {\\n    int n, m;\\n    cin >> n >> m;\\n    vector<vector<int>> g(n);\\n    vector<int> indeg(n, 0);\\n    for (int i = 0; i < m; i++) {\\n        int u, v;\\n        cin >> u >> v;\\n        g[u].push_back(v); indeg[v]++;\\n    }\\n    queue<int> q;\\n    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);\\n    int cnt = 0;\\n    while (!q.empty()) {\\n        int u = q.front(); q.pop(); cnt++;\\n        for (int v : g[u]) if (--indeg[v] == 0) q.push(v);\\n    }\\n    cout << (cnt == n ? \\"ACYCLIC\\" : \\"CYCLE\\") << endl;\\n    return 0;\\n}","PYTHON":"from collections import deque\\nn, m = map(int, input().split())\\ng = [[] for _ in range(n)]\\nindeg = [0] * n\\nfor _ in range(m):\\n    u, v = map(int, input().split())\\n    g[u].append(v)\\n    indeg[v] += 1\\nq = deque(i for i in range(n) if indeg[i] == 0)\\ncnt = 0\\nwhile q:\\n    u = q.popleft(); cnt += 1\\n    for v in g[u]:\\n        indeg[v] -= 1\\n        if indeg[v] == 0: q.append(v)\\nprint(\\"ACYCLIC\\" if cnt == n else \\"CYCLE\\")"}'),
(48, '第K大的数', '<p>给定 N 个整数，输出其中第 K 大的数（1 ≤ K ≤ N）。</p>', 'HARD', '第一行两个整数 N 和 K，第二行 N 个整数。', '一个整数，第 K 大的数。', '6 2\n3 1 4 1 5 9', '5', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt(), k = sc.nextInt();\\n        Integer[] a = new Integer[n];\\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\\n        Arrays.sort(a, (x, y) -> y - x);\\n        System.out.println(a[k-1]);\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int n, k;\\n    cin >> n >> k;\\n    int a[1000];\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    sort(a, a + n, greater<int>());\\n    cout << a[k-1] << endl;\\n    return 0;\\n}","PYTHON":"n, k = map(int, input().split())\\na = list(map(int, input().split()))\\na.sort(reverse=True)\\nprint(a[k-1])"}'),
(49, '括号匹配', '<p>给定一个只含括号 ( ) [ ] { } 的字符串，判断括号是否正确匹配。</p>', 'HARD', '一行，一个只含括号的字符串。', '匹配输出 YES，否则输出 NO。', '{[()]}', 'YES', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String s = sc.nextLine();\\n        Deque<Character> st = new ArrayDeque<>();\\n        for (char c : s.toCharArray()) {\\n            if (c == ''('' || c == ''['' || c == ''{'') st.push(c);\\n            else {\\n                if (st.isEmpty()) { System.out.println(\\"NO\\"); return; }\\n                char t = st.pop();\\n                if ((c == '')'' && t != ''('') || (c == '']'' && t != ''['') || (c == ''}'' && t != ''{'')) {\\n                    System.out.println(\\"NO\\"); return;\\n                }\\n            }\\n        }\\n        System.out.println(st.isEmpty() ? \\"YES\\" : \\"NO\\");\\n    }\\n}","CPP":"#include <iostream>\\n#include <stack>\\n#include <string>\\nusing namespace std;\\n\\nint main() {\\n    string s;\\n    cin >> s;\\n    stack<char> st;\\n    for (char c : s) {\\n        if (c == ''('' || c == ''['' || c == ''{'') st.push(c);\\n        else {\\n            if (st.empty()) { cout << \\"NO\\" << endl; return 0; }\\n            char t = st.top(); st.pop();\\n            if ((c == '')'' && t != ''('') || (c == '']'' && t != ''['') || (c == ''}'' && t != ''{'')) {\\n                cout << \\"NO\\" << endl; return 0;\\n            }\\n        }\\n    }\\n    cout << (st.empty() ? \\"YES\\" : \\"NO\\") << endl;\\n    return 0;\\n}","PYTHON":"s = input().strip()\\nst = []\\nfor c in s:\\n    if c in \\"([{\\": st.append(c)\\n    else:\\n        if not st: print(\\"NO\\"); exit()\\n        t = st.pop()\\n        if (c == \\")\\" and t != \\"(\\") or (c == \\"]\\" and t != \\"[\\") or (c == \\"}\\" and t != \\"{\\"):\\n            print(\\"NO\\"); exit()\\nprint(\\"YES\\" if not st else \\"NO\\")"}'),
(50, '全排列', '<p>输出 1 到 N 的所有排列，按字典序排列。</p>', 'HARD', '一行，一个正整数 N（1 ≤ N ≤ 6）。', '每行一个排列，数字之间用空格分隔。', '3', '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    static int n;\\n    static boolean[] used;\\n    static int[] perm;\\n    static void dfs(int idx) {\\n        if (idx == n) {\\n            for (int i = 0; i < n; i++) System.out.print(perm[i] + (i == n-1 ? \\"\\" : \\" \\"));\\n            System.out.println();\\n            return;\\n        }\\n        for (int i = 1; i <= n; i++) {\\n            if (used[i]) continue;\\n            used[i] = true; perm[idx] = i;\\n            dfs(idx+1);\\n            used[i] = false;\\n        }\\n    }\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        n = sc.nextInt();\\n        used = new boolean[n+1];\\n        perm = new int[n];\\n        dfs(0);\\n    }\\n}","CPP":"#include <iostream>\\n#include <vector>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int n;\\n    cin >> n;\\n    vector<int> a(n);\\n    for (int i = 0; i < n; i++) a[i] = i + 1;\\n    do {\\n        for (int i = 0; i < n; i++) cout << a[i] << (i == n-1 ? \\"\\" : \\" \\");\\n        cout << endl;\\n    } while (next_permutation(a.begin(), a.end()));\\n    return 0;\\n}","PYTHON":"from itertools import permutations\\nn = int(input())\\nfor p in permutations(range(1, n + 1)):\\n    print(*p)"}'),
(51, '最短路径', '<p>给定一个带权无向图和节点数，求从节点 0 到节点 N-1 的最短路径长度。<br>如果不可达输出 -1。</p>', 'HARD', '第一行两个整数 N 和 M，接下来 M 行每行三个整数 u v w（边 u-v，权重 w）。', '一个整数，最短路径长度；不可达输出 -1。', '4 4\n0 1 2\n0 2 5\n1 3 3\n2 3 1', '5', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt(), m = sc.nextInt();\\n        long[][] d = new long[n][n];\\n        for (int i = 0; i < n; i++) { Arrays.fill(d[i], Long.MAX_VALUE / 2); d[i][i] = 0; }\\n        for (int i = 0; i < m; i++) {\\n            int u = sc.nextInt(), v = sc.nextInt(), w = sc.nextInt();\\n            d[u][v] = Math.min(d[u][v], w); d[v][u] = Math.min(d[v][u], w);\\n        }\\n        for (int k = 0; k < n; k++)\\n            for (int i = 0; i < n; i++)\\n                for (int j = 0; j < n; j++)\\n                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];\\n        System.out.println(d[0][n-1] >= Long.MAX_VALUE / 2 ? -1 : d[0][n-1]);\\n    }\\n}","CPP":"#include <iostream>\\n#include <algorithm>\\nusing namespace std;\\n\\nint main() {\\n    int n, m;\\n    cin >> n >> m;\\n    long long d[101][101];\\n    const long long INF = 1e18;\\n    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) d[i][j] = (i == j ? 0 : INF);\\n    for (int i = 0; i < m; i++) {\\n        int u, v, w;\\n        cin >> u >> v >> w;\\n        d[u][v] = min(d[u][v], (long long)w);\\n        d[v][u] = min(d[v][u], (long long)w);\\n    }\\n    for (int k = 0; k < n; k++)\\n        for (int i = 0; i < n; i++)\\n            for (int j = 0; j < n; j++)\\n                if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];\\n    cout << (d[0][n-1] >= INF ? -1 : d[0][n-1]) << endl;\\n    return 0;\\n}","PYTHON":"n, m = map(int, input().split())\\nINF = 10**18\\nd = [[INF] * n for _ in range(n)]\\nfor i in range(n): d[i][i] = 0\\nfor _ in range(m):\\n    u, v, w = map(int, input().split())\\n    d[u][v] = min(d[u][v], w)\\n    d[v][u] = min(d[v][u], w)\\nfor k in range(n):\\n    for i in range(n):\\n        for j in range(n):\\n            if d[i][k] + d[k][j] < d[i][j]: d[i][j] = d[i][k] + d[k][j]\\nprint(d[0][n-1] if d[0][n-1] < INF else -1)"}'),
(52, '区间和查询', '<p>给定一个数组，回答 Q 次区间求和查询。使用前缀和快速计算。</p>', 'HARD', '第一行两个整数 N 和 Q，第二行 N 个整数，接下来 Q 行每行两个整数 l 和 r（闭区间，从 1 开始）。', 'Q 行，每行一个整数，对应区间的和。', '5 3\n1 2 3 4 5\n1 3\n2 5\n3 3', '6\n14\n3', '{"JAVA":"import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt(), q = sc.nextInt();\\n        long[] pre = new long[n+1];\\n        for (int i = 1; i <= n; i++) pre[i] = pre[i-1] + sc.nextLong();\\n        for (int i = 0; i < q; i++) {\\n            int l = sc.nextInt(), r = sc.nextInt();\\n            System.out.println(pre[r] - pre[l-1]);\\n        }\\n    }\\n}","CPP":"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int n, q;\\n    cin >> n >> q;\\n    long long pre[100001] = {0};\\n    for (int i = 1; i <= n; i++) {\\n        long long x;\\n        cin >> x;\\n        pre[i] = pre[i-1] + x;\\n    }\\n    while (q--) {\\n        int l, r;\\n        cin >> l >> r;\\n        cout << pre[r] - pre[l-1] << endl;\\n    }\\n    return 0;\\n}","PYTHON":"n, q = map(int, input().split())\\na = list(map(int, input().split()))\\npre = [0]\\nfor x in a: pre.append(pre[-1] + x)\\nfor _ in range(q):\\n    l, r = map(int, input().split())\\n    print(pre[r] - pre[l - 1])"}');

INSERT IGNORE INTO `test_case` (`problem_id`, `input`, `expected_output`, `is_sample`) VALUES
(3, '10 3', '7', TRUE),
(3, '5 9', '-4', FALSE),
(3, '100 1', '99', FALSE),
(3, '0 0', '0', FALSE),
(4, '1 2 3', '2', TRUE),
(4, '4 5 6', '5', FALSE),
(4, '10 20 30', '20', FALSE),
(4, '1 1 1', '1', FALSE),
(5, '-5', '5', TRUE),
(5, '0', '0', FALSE),
(5, '42', '42', FALSE),
(5, '-100', '100', FALSE),
(6, '5', 'POSITIVE', TRUE),
(6, '-3', 'NEGATIVE', FALSE),
(6, '0', 'ZERO', FALSE),
(6, '-100', 'NEGATIVE', FALSE),
(7, '2000', 'YES', TRUE),
(7, '1900', 'NO', FALSE),
(7, '2024', 'YES', FALSE),
(7, '2023', 'NO', FALSE),
(8, '100', '37', TRUE),
(8, '32', '0', FALSE),
(8, '212', '100', FALSE),
(8, '0', '-17', FALSE),
(9, '100', '5050', TRUE),
(9, '1', '1', FALSE),
(9, '10', '55', FALSE),
(9, '100000', '5000050000', FALSE),
(10, '16', 'YES', TRUE),
(10, '15', 'NO', FALSE),
(10, '100', 'YES', FALSE),
(10, '0', 'YES', FALSE),
(11, '5 9', '9', TRUE),
(11, '10 10', '10', FALSE),
(11, '-3 -8', '-3', FALSE),
(12, 'a', '97', TRUE),
(12, 'z', '122', FALSE),
(12, 'c', '99', FALSE),
(13, '3 7', '7 3', TRUE),
(13, '1 2', '2 1', FALSE),
(13, '-5 0', '0 -5', FALSE),
(14, '45', '54', TRUE),
(14, '10', '1', FALSE),
(14, '99', '99', FALSE),
(15, '17 5', '3 2', TRUE),
(15, '10 2', '5 0', FALSE),
(15, '7 3', '2 1', FALSE),
(16, '1 5 3', '5', TRUE),
(16, '10 10 1', '10', FALSE),
(16, '-1 -5 -3', '-1', FALSE),
(17, 'hello', '5', TRUE),
(17, 'world', '5', FALSE),
(17, 'abc', '3', FALSE),
(18, 'a', 'A', TRUE),
(18, 'z', 'Z', FALSE),
(18, 'm', 'M', FALSE),
(19, 'a', 'b', TRUE),
(19, 'z', 'a', FALSE),
(19, 'm', 'n', FALSE),
(20, '12321', 'YES', TRUE),
(20, '12345', 'NO', FALSE),
(20, '1001', 'YES', FALSE),
(20, '123', 'NO', FALSE),
(21, '12 18', '6', TRUE),
(21, '7 13', '1', FALSE),
(21, '100 50', '50', FALSE),
(22, '4 6', '12', TRUE),
(22, '3 5', '15', FALSE),
(22, '8 12', '24', FALSE),
(23, '1234', '10', TRUE),
(23, '99999', '45', FALSE),
(23, '1000', '1', FALSE),
(23, '0', '0', FALSE),
(24, '10', '1010', TRUE),
(24, '0', '0', FALSE),
(24, '255', '11111111', FALSE),
(24, '5', '101', FALSE),
(25, '5\n5 2 8 1 9', '1 2 5 8 9', TRUE),
(25, '3\n3 2 1', '1 2 3', FALSE),
(25, '1\n7', '7', FALSE),
(26, 'level', 'YES', TRUE),
(26, 'hello', 'NO', FALSE),
(26, 'abba', 'YES', FALSE),
(26, 'a', 'YES', FALSE),
(27, '10', '55', TRUE),
(27, '0', '0', FALSE),
(27, '1', '1', FALSE),
(27, '20', '6765', FALSE),
(28, '5', '120', TRUE),
(28, '1', '1', FALSE),
(28, '20', '2432902008176640000', FALSE),
(28, '10', '3628800', FALSE),
(29, '5\n1 3 5 7 9\n5', '2', TRUE),
(29, '5\n1 3 5 7 9\n4', '-1', FALSE),
(29, '3\n10 20 30\n30', '2', FALSE),
(30, '5\n1 2 1 3 2', '1 2 3', TRUE),
(30, '4\n7 7 7 7', '7', FALSE),
(30, '3\n1 2 3', '1 2 3', FALSE),
(31, '2 3\n1 2 3\n4 5 6', '1 4\n2 5\n3 6', TRUE),
(31, '3 2\n1 2\n3 4\n5 6', '1 3 5\n2 4 6', FALSE),
(32, 'hello', 'olleh', TRUE),
(32, 'abc', 'cba', FALSE),
(32, 'racecar', 'racecar', FALSE),
(33, '17', 'YES', TRUE),
(33, '100', 'NO', FALSE),
(33, '97', 'YES', FALSE),
(33, '2', 'YES', FALSE),
(34, 'hello world', '2', TRUE),
(34, 'one two three', '3', FALSE),
(34, 'hello', '1', FALSE),
(34, '   ', '0', FALSE),
(35, '4', '1\n1 1\n1 2 1\n1 3 3 1', TRUE),
(35, '1', '1', FALSE),
(35, '3', '1\n1 1\n1 2 1', FALSE),
(36, '4\n4 3 2 1', '6', TRUE),
(36, '3\n1 2 3', '0', FALSE),
(36, '5\n5 1 4 2 8', '4', FALSE),
(37, 'abcde\nace', '3', TRUE),
(37, 'abc\nabc', '3', FALSE),
(37, 'abc\ndef', '0', FALSE),
(37, 'abcdef\nacf', '3', FALSE),
(38, '3 5\n2 3\n1 2\n3 4', '7', TRUE),
(38, '2 3\n1 1\n2 2', '3', FALSE),
(38, '4 10\n2 1\n3 2\n4 3\n5 4', '7', FALSE),
(39, '6\n1 7 2 8 3 9', '4', TRUE),
(39, '5\n5 4 3 2 1', '1', FALSE),
(39, '4\n1 2 3 4', '4', FALSE),
(40, '99999999999999999999\n1', '100000000000000000000', TRUE),
(40, '123\n456', '579', FALSE),
(40, '111111111111111111111111111111\n888888888888888888888888888889', '1000000000000000000000000000000', FALSE),
(41, '8', '92', TRUE),
(41, '4', '2', FALSE),
(41, '1', '1', FALSE),
(42, '3+5*2', '13', TRUE),
(42, '1+2+3', '6', FALSE),
(42, '2*3*4', '24', FALSE),
(42, '10+5*2-3', '17', FALSE),
(43, '5 2', '3', TRUE),
(43, '7 3', '4', FALSE),
(43, '1 1', '1', FALSE),
(44, '3\n1 3\n2 6\n8 10', '2', TRUE),
(44, '2\n1 4\n4 5', '1', FALSE),
(44, '3\n1 2\n3 4\n5 6', '3', FALSE),
(45, '8 3\n1 3 -1 -3 5 3 6 7', '3 3 5 5 6 7', TRUE),
(45, '1 1\n5', '5', FALSE),
(45, '4 2\n1 2 3 4', '2 3 4', FALSE),
(46, '4', '5', TRUE),
(46, '1', '1', FALSE),
(46, '10', '89', FALSE),
(47, '4 4\n0 1\n1 2\n2 3\n3 0', 'CYCLE', TRUE),
(47, '4 3\n0 1\n0 2\n1 3', 'ACYCLIC', FALSE),
(47, '3 0', 'ACYCLIC', FALSE),
(48, '6 2\n3 1 4 1 5 9', '5', TRUE),
(48, '5 1\n1 2 3 4 5', '5', FALSE),
(48, '4 4\n2 8 4 6', '2', FALSE),
(49, '{[()]}', 'YES', TRUE),
(49, '{[(])}', 'NO', FALSE),
(49, '([])', 'YES', FALSE),
(49, '(', 'NO', FALSE),
(50, '3', '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1', TRUE),
(50, '2', '1 2\n2 1', FALSE),
(50, '1', '1', FALSE),
(51, '4 4\n0 1 2\n0 2 5\n1 3 3\n2 3 1', '5', TRUE),
(51, '3 2\n0 1 1\n1 2 1', '2', FALSE),
(51, '2 0', '-1', FALSE),
(52, '5 3\n1 2 3 4 5\n1 3\n2 5\n3 3', '6\n14\n3', TRUE),
(52, '3 1\n10 20 30\n1 3', '60', FALSE),
(52, '2 2\n5 5\n1 1\n2 2', '5\n5', FALSE);

-- ============================================
-- 完成
-- ============================================
SELECT '数据库初始化完成！' AS message;
SELECT CONCAT('用户表：', COUNT(*), ' 条') FROM `user`;
SELECT CONCAT('题目表：', COUNT(*), ' 条') FROM `problem`;
SELECT CONCAT('测试用例：', COUNT(*), ' 条') FROM `test_case`;
