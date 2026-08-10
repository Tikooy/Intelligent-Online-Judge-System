module.exports = [
  {
    title: '回文数判断', diff: 'MEDIUM',
    desc: '<p>输入一个正整数 N，判断它是否为回文数。<br>回文数是指正序和倒序读都相同的数。</p>',
    inFmt: '一行，一个正整数 N。',
    outFmt: '是回文数输出 YES，否则输出 NO。',
    sampleIn: '12321', sampleOut: 'YES',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int rev = 0, x = n;\n        while (x > 0) { rev = rev * 10 + x % 10; x /= 10; }\n        System.out.println(rev == n ? "YES" : "NO");\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int rev = 0, x = n;\n    while (x > 0) { rev = rev * 10 + x % 10; x /= 10; }\n    cout << (rev == n ? "YES" : "NO") << endl;\n    return 0;\n}',
      PYTHON: 'n = input()\nprint("YES" if n == n[::-1] else "NO")'
    },
    tests: [['12321', 'YES'], ['12345', 'NO'], ['1001', 'YES'], ['123', 'NO']]
  },
  {
    title: '最大公约数', diff: 'MEDIUM',
    desc: '<p>输入两个正整数 A 和 B，输出它们的最大公约数。</p>',
    inFmt: '一行，两个正整数 A 和 B。',
    outFmt: '一个整数，A 和 B 的最大公约数。',
    sampleIn: '12 18', sampleOut: '6',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        while (b != 0) { int t = a % b; a = b; b = t; }\n        System.out.println(a);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    while (b != 0) { int t = a % b; a = b; b = t; }\n    cout << a << endl;\n    return 0;\n}',
      PYTHON: 'import math\na, b = map(int, input().split())\nprint(math.gcd(a, b))'
    },
    tests: [['12 18', '6'], ['7 13', '1'], ['100 50', '50']]
  },
  {
    title: '最小公倍数', diff: 'MEDIUM',
    desc: '<p>输入两个正整数 A 和 B，输出它们的最小公倍数。</p>',
    inFmt: '一行，两个正整数 A 和 B。',
    outFmt: '一个整数，A 和 B 的最小公倍数。',
    sampleIn: '4 6', sampleOut: '12',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    static int gcd(int a, int b) { while (b != 0) { int t = a % b; a = b; b = t; } return a; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        long lcm = (long) a / gcd(a, b) * b;\n        System.out.println(lcm);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    long long x = a, y = b;\n    while (y != 0) { long long t = x % y; x = y; y = t; }\n    cout << a / x * b << endl;\n    return 0;\n}',
      PYTHON: 'import math\na, b = map(int, input().split())\nprint(a * b // math.gcd(a, b))'
    },
    tests: [['4 6', '12'], ['3 5', '15'], ['8 12', '24']]
  },
  {
    title: '各位数字之和', diff: 'MEDIUM',
    desc: '<p>输入一个正整数 N，输出它各位数字之和。</p>',
    inFmt: '一行，一个正整数 N。',
    outFmt: '一个整数，各位数字之和。',
    sampleIn: '1234', sampleOut: '10',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int s = 0;\n        while (n > 0) { s += n % 10; n /= 10; }\n        System.out.println(s);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int s = 0;\n    while (n > 0) { s += n % 10; n /= 10; }\n    cout << s << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nprint(sum(int(c) for c in str(n)))'
    },
    tests: [['1234', '10'], ['99999', '45'], ['1000', '1'], ['0', '0']]
  },
  {
    title: '十进制转二进制', diff: 'MEDIUM',
    desc: '<p>输入一个非负整数 N，输出它的二进制表示。</p>',
    inFmt: '一行，一个非负整数 N。',
    outFmt: '一个字符串，N 的二进制表示。',
    sampleIn: '10', sampleOut: '1010',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n == 0) { System.out.println(0); return; }\n        StringBuilder sb = new StringBuilder();\n        while (n > 0) { sb.append(n % 2); n /= 2; }\n        System.out.println(sb.reverse().toString());\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n == 0) { cout << 0 << endl; return 0; }\n    string s;\n    while (n > 0) { s += (char)(\'0\' + n % 2); n /= 2; }\n    for (int i = s.size() - 1; i >= 0; i--) cout << s[i];\n    cout << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nprint(bin(n)[2:])'
    },
    tests: [['10', '1010'], ['0', '0'], ['255', '11111111'], ['5', '101']]
  },
  {
    title: '数组排序', diff: 'MEDIUM',
    desc: '<p>输入 N 个整数，将它们按升序排序后输出。</p>',
    inFmt: '第一行一个整数 N，第二行 N 个整数，以空格分隔。',
    outFmt: '一行，排序后的 N 个整数，以空格分隔。',
    sampleIn: '5\n5 2 8 1 9', sampleOut: '1 2 5 8 9',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        Arrays.sort(a);\n        for (int i = 0; i < n; i++) System.out.print(a[i] + (i == n - 1 ? "" : " "));\n        System.out.println();\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int a[1000];\n    for (int i = 0; i < n; i++) cin >> a[i];\n    sort(a, a + n);\n    for (int i = 0; i < n; i++) cout << a[i] << (i == n - 1 ? "" : " ");\n    cout << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\na = list(map(int, input().split()))\na.sort()\nprint(*a)'
    },
    tests: [['5\n5 2 8 1 9', '1 2 5 8 9'], ['3\n3 2 1', '1 2 3'], ['1\n7', '7']]
  },
  {
    title: '回文字符串', diff: 'MEDIUM',
    desc: '<p>输入一个字符串，判断它是否为回文（正序和倒序相同）。</p>',
    inFmt: '一行，一个不含空格的字符串。',
    outFmt: '是回文输出 YES，否则输出 NO。',
    sampleIn: 'level', sampleOut: 'YES',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        String r = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(r) ? "YES" : "NO");\n    }\n}',
      CPP: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s, r;\n    cin >> s;\n    r = s;\n    reverse(r.begin(), r.end());\n    cout << (s == r ? "YES" : "NO") << endl;\n    return 0;\n}',
      PYTHON: 's = input()\nprint("YES" if s == s[::-1] else "NO")'
    },
    tests: [['level', 'YES'], ['hello', 'NO'], ['abba', 'YES'], ['a', 'YES']]
  },
  {
    title: '斐波那契数列', diff: 'MEDIUM',
    desc: '<p>斐波那契数列定义：F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)。<br>输入 N，输出 F(N)。</p>',
    inFmt: '一行，一个非负整数 N（0 ≤ N ≤ 40）。',
    outFmt: '一个整数，第 N 项的值。',
    sampleIn: '10', sampleOut: '55',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long a = 0, b = 1;\n        for (int i = 0; i < n; i++) { long t = a + b; a = b; b = t; }\n        System.out.println(a);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long a = 0, b = 1;\n    for (int i = 0; i < n; i++) { long long t = a + b; a = b; b = t; }\n    cout << a << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\na, b = 0, 1\nfor _ in range(n): a, b = b, a + b\nprint(a)'
    },
    tests: [['10', '55'], ['0', '0'], ['1', '1'], ['20', '6765']]
  },
  {
    title: '阶乘', diff: 'MEDIUM',
    desc: '<p>输入一个正整数 N，输出 N 的阶乘（N!）。</p>',
    inFmt: '一行，一个正整数 N（1 ≤ N ≤ 20）。',
    outFmt: '一个整数，N! 的值。',
    sampleIn: '5', sampleOut: '120',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long f = 1;\n        for (int i = 2; i <= n; i++) f *= i;\n        System.out.println(f);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long f = 1;\n    for (int i = 2; i <= n; i++) f *= i;\n    cout << f << endl;\n    return 0;\n}',
      PYTHON: 'import math\nn = int(input())\nprint(math.factorial(n))'
    },
    tests: [['5', '120'], ['1', '1'], ['20', '2432902008176640000'], ['10', '3628800']]
  },
  {
    title: '二分查找', diff: 'MEDIUM',
    desc: '<p>给定一个升序数组和目标值，使用二分查找返回目标值的下标（从 0 开始），找不到返回 -1。</p>',
    inFmt: '第一行 N，第二行 N 个升序整数，第三行目标值 target。',
    outFmt: '一个整数，目标值的下标，找不到则输出 -1。',
    sampleIn: '5\n1 3 5 7 9\n5', sampleOut: '2',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        int t = sc.nextInt();\n        int lo = 0, hi = n - 1, ans = -1;\n        while (lo <= hi) {\n            int mid = (lo + hi) / 2;\n            if (a[mid] == t) { ans = mid; break; }\n            else if (a[mid] < t) lo = mid + 1;\n            else hi = mid - 1;\n        }\n        System.out.println(ans);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int a[1000];\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int t;\n    cin >> t;\n    int lo = 0, hi = n - 1, ans = -1;\n    while (lo <= hi) {\n        int mid = (lo + hi) / 2;\n        if (a[mid] == t) { ans = mid; break; }\n        else if (a[mid] < t) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    cout << ans << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\na = list(map(int, input().split()))\nt = int(input())\nlo, hi, ans = 0, n - 1, -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == t: ans = mid; break\n    elif a[mid] < t: lo = mid + 1\n    else: hi = mid - 1\nprint(ans)'
    },
    tests: [['5\n1 3 5 7 9\n5', '2'], ['5\n1 3 5 7 9\n4', '-1'], ['3\n10 20 30\n30', '2']]
  },
  {
    title: '数组去重', diff: 'MEDIUM',
    desc: '<p>输入 N 个整数，去除重复元素后输出（保留首次出现的顺序）。</p>',
    inFmt: '第一行 N，第二行 N 个整数。',
    outFmt: '一行，去重后的整数，以空格分隔。',
    sampleIn: '5\n1 2 1 3 2', sampleOut: '1 2 3',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        LinkedHashSet<Integer> set = new LinkedHashSet<>();\n        for (int i = 0; i < n; i++) set.add(sc.nextInt());\n        StringBuilder sb = new StringBuilder();\n        for (int x : set) sb.append(x).append(" ");\n        System.out.println(sb.toString().trim());\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int a[1000];\n    for (int i = 0; i < n; i++) cin >> a[i];\n    for (int i = 0; i < n; i++) {\n        bool dup = false;\n        for (int j = 0; j < i; j++) if (a[j] == a[i]) { dup = true; break; }\n        if (!dup) cout << a[i] << " ";\n    }\n    cout << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\na = list(map(int, input().split()))\nseen = []\nfor x in a:\n    if x not in seen: seen.append(x)\nprint(*seen)'
    },
    tests: [['5\n1 2 1 3 2', '1 2 3'], ['4\n7 7 7 7', '7'], ['3\n1 2 3', '1 2 3']]
  },
  {
    title: '矩阵转置', diff: 'MEDIUM',
    desc: '<p>给定一个 R 行 C 列的矩阵，输出它的转置矩阵（C 行 R 列）。</p>',
    inFmt: '第一行两个整数 R 和 C，接下来 R 行每行 C 个整数。',
    outFmt: 'C 行，每行 R 个整数，即转置后的矩阵。',
    sampleIn: '2 3\n1 2 3\n4 5 6', sampleOut: '1 4\n2 5\n3 6',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int r = sc.nextInt(), c = sc.nextInt();\n        int[][] m = new int[r][c];\n        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) m[i][j] = sc.nextInt();\n        for (int j = 0; j < c; j++) {\n            for (int i = 0; i < r; i++) System.out.print(m[i][j] + (i == r - 1 ? "" : " "));\n            System.out.println();\n        }\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int r, c;\n    cin >> r >> c;\n    int m[100][100];\n    for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) cin >> m[i][j];\n    for (int j = 0; j < c; j++) {\n        for (int i = 0; i < r; i++) cout << m[i][j] << (i == r - 1 ? "" : " ");\n        cout << endl;\n    }\n    return 0;\n}',
      PYTHON: 'r, c = map(int, input().split())\nm = [list(map(int, input().split())) for _ in range(r)]\nfor j in range(c):\n    print(*[m[i][j] for i in range(r)])'
    },
    tests: [['2 3\n1 2 3\n4 5 6', '1 4\n2 5\n3 6'], ['3 2\n1 2\n3 4\n5 6', '1 3 5\n2 4 6']]
  },
  {
    title: '字符串反转', diff: 'MEDIUM',
    desc: '<p>输入一个字符串，输出反转后的字符串。</p>',
    inFmt: '一行，一个字符串。',
    outFmt: '一行，反转后的字符串。',
    sampleIn: 'hello', sampleOut: 'olleh',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(new StringBuilder(sc.nextLine()).reverse().toString());\n    }\n}',
      CPP: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}',
      PYTHON: 'print(input()[::-1])'
    },
    tests: [['hello', 'olleh'], ['abc', 'cba'], ['racecar', 'racecar']]
  },
  {
    title: '素数判定', diff: 'MEDIUM',
    desc: '<p>输入一个整数 N，判断它是否为素数。</p>',
    inFmt: '一行，一个正整数 N（2 ≤ N ≤ 1000000）。',
    outFmt: '是素数输出 YES，否则输出 NO。',
    sampleIn: '17', sampleOut: 'YES',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        boolean prime = n >= 2;\n        for (int i = 2; (long) i * i <= n; i++) {\n            if (n % i == 0) { prime = false; break; }\n        }\n        System.out.println(prime ? "YES" : "NO");\n    }\n}',
      CPP: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    bool prime = n >= 2;\n    for (int i = 2; (long long) i * i <= n; i++) {\n        if (n % i == 0) { prime = false; break; }\n    }\n    cout << (prime ? "YES" : "NO") << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nprime = n >= 2\nfor i in range(2, int(n ** 0.5) + 1):\n    if n % i == 0: prime = False; break\nprint("YES" if prime else "NO")'
    },
    tests: [['17', 'YES'], ['100', 'NO'], ['97', 'YES'], ['2', 'YES']]
  },
  {
    title: '统计单词数', diff: 'MEDIUM',
    desc: '<p>输入一行字符串（可能包含多个连续空格），统计其中单词的个数。</p>',
    inFmt: '一行，一个字符串。',
    outFmt: '一个整数，单词个数。',
    sampleIn: 'hello world', sampleOut: '2',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim();\n        if (s.isEmpty()) System.out.println(0);\n        else System.out.println(s.split("\\\\s+").length);\n    }\n}',
      CPP: '#include <iostream>\n#include <sstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line, w;\n    getline(cin, line);\n    stringstream ss(line);\n    int cnt = 0;\n    while (ss >> w) cnt++;\n    cout << cnt << endl;\n    return 0;\n}',
      PYTHON: 's = input().strip()\nprint(len(s.split()) if s else 0)'
    },
    tests: [['hello world', '2'], ['one two three', '3'], ['hello', '1'], ['   ', '0']]
  },
  {
    title: '杨辉三角', diff: 'MEDIUM',
    desc: '<p>输出前 N 行的杨辉三角。每行的第一个和最后一个数为 1，其余数为上方两数之和。</p>',
    inFmt: '一行，一个正整数 N（1 ≤ N ≤ 10）。',
    outFmt: 'N 行，每行若干整数，以空格分隔。',
    sampleIn: '4', sampleOut: '1\n1 1\n1 2 1\n1 3 3 1',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[][] t = new int[n][n];\n        for (int i = 0; i < n; i++) {\n            t[i][0] = 1; t[i][i] = 1;\n            for (int j = 1; j < i; j++) t[i][j] = t[i-1][j-1] + t[i-1][j];\n            for (int j = 0; j <= i; j++) System.out.print(t[i][j] + (j == i ? "" : " "));\n            System.out.println();\n        }\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int t[10][10] = {0};\n    for (int i = 0; i < n; i++) {\n        t[i][0] = 1; t[i][i] = 1;\n        for (int j = 1; j < i; j++) t[i][j] = t[i-1][j-1] + t[i-1][j];\n        for (int j = 0; j <= i; j++) cout << t[i][j] << (j == i ? "" : " ");\n        cout << endl;\n    }\n    return 0;\n}',
      PYTHON: 'n = int(input())\nt = [[0] * n for _ in range(n)]\nfor i in range(n):\n    t[i][0] = t[i][i] = 1\n    for j in range(1, i): t[i][j] = t[i-1][j-1] + t[i-1][j]\n    print(*[t[i][j] for j in range(i + 1)])'
    },
    tests: [['4', '1\n1 1\n1 2 1\n1 3 3 1'], ['1', '1'], ['3', '1\n1 1\n1 2 1']]
  },
  {
    title: '冒泡排序交换次数', diff: 'MEDIUM',
    desc: '<p>对 N 个整数进行冒泡排序，输出排序过程中的交换次数。</p>',
    inFmt: '第一行 N，第二行 N 个整数。',
    outFmt: '一个整数，冒泡排序的交换次数。',
    sampleIn: '4\n4 3 2 1', sampleOut: '6',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        int cnt = 0;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - 1 - i; j++) {\n                if (a[j] > a[j+1]) { int t = a[j]; a[j] = a[j+1]; a[j+1] = t; cnt++; }\n            }\n        }\n        System.out.println(cnt);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int a[1000];\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int cnt = 0;\n    for (int i = 0; i < n - 1; i++)\n        for (int j = 0; j < n - 1 - i; j++)\n            if (a[j] > a[j+1]) { int t = a[j]; a[j] = a[j+1]; a[j+1] = t; cnt++; }\n    cout << cnt << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\na = list(map(int, input().split()))\ncnt = 0\nfor i in range(n - 1):\n    for j in range(n - 1 - i):\n        if a[j] > a[j+1]: a[j], a[j+1] = a[j+1], a[j]; cnt += 1\nprint(cnt)'
    },
    tests: [['4\n4 3 2 1', '6'], ['3\n1 2 3', '0'], ['5\n5 1 4 2 8', '4']]
  }
];
