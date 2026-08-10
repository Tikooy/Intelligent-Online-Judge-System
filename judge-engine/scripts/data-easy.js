module.exports = [
  {
    title: '两数之差', diff: 'EASY',
    desc: '<p>输入两个整数 A 和 B，输出 A 减 B 的结果。</p>',
    inFmt: '一行，两个整数 A 和 B，以空格分隔。',
    outFmt: '一个整数，即 A - B 的结果。',
    sampleIn: '10 3', sampleOut: '7',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a - b);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a - b << endl;\n    return 0;\n}',
      PYTHON: 'a, b = map(int, input().split())\nprint(a - b)'
    },
    tests: [['10 3', '7'], ['5 9', '-4'], ['100 1', '99'], ['0 0', '0']]
  },
  {
    title: '三个数的平均值', diff: 'EASY',
    desc: '<p>输入三个整数，输出它们的平均值（向下取整）。</p>',
    inFmt: '一行，三个整数，以空格分隔。',
    outFmt: '一个整数，三个数的平均值。',
    sampleIn: '1 2 3', sampleOut: '2',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\n        System.out.println((a + b + c) / 3);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << (a + b + c) / 3 << endl;\n    return 0;\n}',
      PYTHON: 'a, b, c = map(int, input().split())\nprint((a + b + c) // 3)'
    },
    tests: [['1 2 3', '2'], ['4 5 6', '5'], ['10 20 30', '20'], ['1 1 1', '1']]
  },
  {
    title: '绝对值', diff: 'EASY',
    desc: '<p>输入一个整数 N，输出它的绝对值。</p>',
    inFmt: '一行，一个整数 N。',
    outFmt: '一个整数，即 |N|。',
    sampleIn: '-5', sampleOut: '5',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(Math.abs(n));\n    }\n}',
      CPP: '#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    cout << abs(n) << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nprint(abs(n))'
    },
    tests: [['-5', '5'], ['0', '0'], ['42', '42'], ['-100', '100']]
  },
  {
    title: '判断正负', diff: 'EASY',
    desc: '<p>输入一个整数 N，判断它是正数、负数还是零。<br>正数输出 POSITIVE，负数输出 NEGATIVE，零输出 ZERO。</p>',
    inFmt: '一行，一个整数 N。',
    outFmt: 'POSITIVE、NEGATIVE 或 ZERO。',
    sampleIn: '5', sampleOut: 'POSITIVE',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n > 0) System.out.println("POSITIVE");\n        else if (n < 0) System.out.println("NEGATIVE");\n        else System.out.println("ZERO");\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n > 0) cout << "POSITIVE" << endl;\n    else if (n < 0) cout << "NEGATIVE" << endl;\n    else cout << "ZERO" << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nif n > 0:\n    print("POSITIVE")\nelif n < 0:\n    print("NEGATIVE")\nelse:\n    print("ZERO")'
    },
    tests: [['5', 'POSITIVE'], ['-3', 'NEGATIVE'], ['0', 'ZERO'], ['-100', 'NEGATIVE']]
  },
  {
    title: '判断闰年', diff: 'EASY',
    desc: '<p>输入一个年份 Y，判断是否为闰年。<br>闰年规则：能被 4 整除但不能被 100 整除，或者能被 400 整除。</p>',
    inFmt: '一行，一个整数 Y。',
    outFmt: '是闰年输出 YES，否则输出 NO。',
    sampleIn: '2000', sampleOut: 'YES',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int y = sc.nextInt();\n        boolean leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;\n        System.out.println(leap ? "YES" : "NO");\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int y;\n    cin >> y;\n    bool leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;\n    cout << (leap ? "YES" : "NO") << endl;\n    return 0;\n}',
      PYTHON: 'y = int(input())\nprint("YES" if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0 else "NO")'
    },
    tests: [['2000', 'YES'], ['1900', 'NO'], ['2024', 'YES'], ['2023', 'NO']]
  },
  {
    title: '华氏度转摄氏度', diff: 'EASY',
    desc: '<p>输入一个华氏温度 F，输出对应的摄氏温度 C（向下取整）。<br>公式：C = (F - 32) × 5 / 9。</p>',
    inFmt: '一行，一个整数 F。',
    outFmt: '一个整数，转换后的摄氏温度。',
    sampleIn: '100', sampleOut: '37',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int f = sc.nextInt();\n        System.out.println((f - 32) * 5 / 9);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int f;\n    cin >> f;\n    cout << (f - 32) * 5 / 9 << endl;\n    return 0;\n}',
      PYTHON: 'f = int(input())\nprint((f - 32) * 5 // 9)'
    },
    tests: [['100', '37'], ['32', '0'], ['212', '100'], ['0', '-17']]
  },
  {
    title: '1到N的累加和', diff: 'EASY',
    desc: '<p>输入一个整数 N，输出 1 + 2 + ... + N 的值。</p>',
    inFmt: '一行，一个整数 N（1 ≤ N ≤ 100000）。',
    outFmt: '一个整数，累加和。',
    sampleIn: '100', sampleOut: '5050',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        System.out.println(n * (n + 1) / 2);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n    cout << n * (n + 1) / 2 << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nprint(n * (n + 1) // 2)'
    },
    tests: [['100', '5050'], ['1', '1'], ['10', '55'], ['100000', '5000050000']]
  },
  {
    title: '平方数判断', diff: 'EASY',
    desc: '<p>输入一个整数 N，判断它是否为完全平方数。</p>',
    inFmt: '一行，一个整数 N。',
    outFmt: '是完全平方数输出 YES，否则输出 NO。',
    sampleIn: '16', sampleOut: 'YES',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int s = (int) Math.sqrt(n);\n        System.out.println(s * s == n ? "YES" : "NO");\n    }\n}',
      CPP: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int s = (int) sqrt(n);\n    cout << (s * s == n ? "YES" : "NO") << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\ns = int(n ** 0.5)\nprint("YES" if s * s == n else "NO")'
    },
    tests: [['16', 'YES'], ['15', 'NO'], ['100', 'YES'], ['0', 'YES']]
  },
  {
    title: '两个数的最大值', diff: 'EASY',
    desc: '<p>输入两个整数，输出较大的那个数。</p>',
    inFmt: '一行，两个整数 A 和 B。',
    outFmt: '一个整数，两数中的最大值。',
    sampleIn: '5 9', sampleOut: '9',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        System.out.println(Math.max(a, b));\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << max(a, b) << endl;\n    return 0;\n}',
      PYTHON: 'a, b = map(int, input().split())\nprint(max(a, b))'
    },
    tests: [['5 9', '9'], ['10 10', '10'], ['-3 -8', '-3']]
  },
  {
    title: '字符ASCII码', diff: 'EASY',
    desc: '<p>输入一个小写字母，输出它的 ASCII 码值。</p>',
    inFmt: '一行，一个小写字母。',
    outFmt: '一个整数，该字母的 ASCII 码。',
    sampleIn: 'a', sampleOut: '97',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        char c = sc.next().charAt(0);\n        System.out.println((int) c);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    char c;\n    cin >> c;\n    cout << (int) c << endl;\n    return 0;\n}',
      PYTHON: 'print(ord(input()))'
    },
    tests: [['a', '97'], ['z', '122'], ['c', '99']]
  },
  {
    title: '交换两个数', diff: 'EASY',
    desc: '<p>输入两个整数 A 和 B，交换它们的顺序后输出。</p>',
    inFmt: '一行，两个整数 A 和 B。',
    outFmt: '一行，先输出 B 再输出 A，空格分隔。',
    sampleIn: '3 7', sampleOut: '7 3',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        System.out.println(b + " " + a);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << b << " " << a << endl;\n    return 0;\n}',
      PYTHON: 'a, b = map(int, input().split())\nprint(b, a)'
    },
    tests: [['3 7', '7 3'], ['1 2', '2 1'], ['-5 0', '0 -5']]
  },
  {
    title: '数字反转（两位数）', diff: 'EASY',
    desc: '<p>输入一个两位数 N，输出反转后的数。<br>例如 45 反转后为 54，10 反转后为 1。</p>',
    inFmt: '一行，一个两位数 N。',
    outFmt: '一个整数，反转后的数。',
    sampleIn: '45', sampleOut: '54',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int a = n / 10, b = n % 10;\n        System.out.println(b * 10 + a);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int a = n / 10, b = n % 10;\n    cout << b * 10 + a << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nprint(int(str(n)[::-1]))'
    },
    tests: [['45', '54'], ['10', '1'], ['99', '99']]
  },
  {
    title: '商和余数', diff: 'EASY',
    desc: '<p>输入两个正整数 A 和 B，输出 A 除以 B 的商和余数。</p>',
    inFmt: '一行，两个正整数 A 和 B。',
    outFmt: '一行，商和余数，以空格分隔。',
    sampleIn: '17 5', sampleOut: '3 2',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        System.out.println(a / b + " " + a % b);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a / b << " " << a % b << endl;\n    return 0;\n}',
      PYTHON: 'a, b = map(int, input().split())\nprint(a // b, a % b)'
    },
    tests: [['17 5', '3 2'], ['10 2', '5 0'], ['7 3', '2 1']]
  },
  {
    title: '三个数中最大的', diff: 'EASY',
    desc: '<p>输入三个整数，输出其中最大的数。</p>',
    inFmt: '一行，三个整数，以空格分隔。',
    outFmt: '一个整数，最大值。',
    sampleIn: '1 5 3', sampleOut: '5',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\n        System.out.println(Math.max(a, Math.max(b, c)));\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << max(a, max(b, c)) << endl;\n    return 0;\n}',
      PYTHON: 'a, b, c = map(int, input().split())\nprint(max(a, b, c))'
    },
    tests: [['1 5 3', '5'], ['10 10 1', '10'], ['-1 -5 -3', '-1']]
  },
  {
    title: '字符串长度', diff: 'EASY',
    desc: '<p>输入一个字符串，输出它的长度。</p>',
    inFmt: '一行，一个字符串。',
    outFmt: '一个整数，字符串长度。',
    sampleIn: 'hello', sampleOut: '5',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(s.length());\n    }\n}',
      CPP: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << s.length() << endl;\n    return 0;\n}',
      PYTHON: 'print(len(input()))'
    },
    tests: [['hello', '5'], ['world', '5'], ['abc', '3']]
  },
  {
    title: '小写转大写', diff: 'EASY',
    desc: '<p>输入一个小写字母，输出对应的大写字母。</p>',
    inFmt: '一行，一个小写字母。',
    outFmt: '一个字符，对应的大写字母。',
    sampleIn: 'a', sampleOut: 'A',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        char c = sc.next().charAt(0);\n        System.out.println((char) (c - 32));\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    char c;\n    cin >> c;\n    cout << (char) (c - 32) << endl;\n    return 0;\n}',
      PYTHON: 'print(input().upper())'
    },
    tests: [['a', 'A'], ['z', 'Z'], ['m', 'M']]
  },
  {
    title: '简单密码', diff: 'EASY',
    desc: '<p>输入一个小写字母，输出字母表中它后面的一个字母。<br>如果输入是 z，则输出 a。</p>',
    inFmt: '一行，一个小写字母。',
    outFmt: '一个字符，后移一位后的字母。',
    sampleIn: 'a', sampleOut: 'b',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        char c = sc.next().charAt(0);\n        System.out.println(c == \'z\' ? \'a\' : (char) (c + 1));\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    char c;\n    cin >> c;\n    cout << (c == \'z\' ? \'a\' : (char) (c + 1)) << endl;\n    return 0;\n}',
      PYTHON: 'c = input()\nprint(\'a\' if c == \'z\' else chr(ord(c) + 1))'
    },
    tests: [['a', 'b'], ['z', 'a'], ['m', 'n']]
  }
];
