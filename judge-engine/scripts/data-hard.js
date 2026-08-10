module.exports = [
  {
    title: '最长公共子序列', diff: 'HARD',
    desc: '<p>给定两个字符串，求它们的最长公共子序列（LCS）的长度。<br>子序列不要求连续，但保持相对顺序。</p>',
    inFmt: '两行，每行一个字符串。',
    outFmt: '一个整数，LCS 的长度。',
    sampleIn: 'abcde\nace', sampleOut: '3',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String a = sc.nextLine(), b = sc.nextLine();\n        int n = a.length(), m = b.length();\n        int[][] dp = new int[n+1][m+1];\n        for (int i = 1; i <= n; i++)\n            for (int j = 1; j <= m; j++)\n                dp[i][j] = a.charAt(i-1) == b.charAt(j-1)\n                    ? dp[i-1][j-1] + 1\n                    : Math.max(dp[i-1][j], dp[i][j-1]);\n        System.out.println(dp[n][m]);\n    }\n}',
      CPP: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string a, b;\n    getline(cin, a); getline(cin, b);\n    int n = a.size(), m = b.size();\n    int dp[1001][1001] = {0};\n    for (int i = 1; i <= n; i++)\n        for (int j = 1; j <= m; j++)\n            dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);\n    cout << dp[n][m] << endl;\n    return 0;\n}',
      PYTHON: 'a = input().strip()\nb = input().strip()\nn, m = len(a), len(b)\ndp = [[0] * (m+1) for _ in range(n+1)]\nfor i in range(1, n+1):\n    for j in range(1, m+1):\n        dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])\nprint(dp[n][m])'
    },
    tests: [['abcde\nace', '3'], ['abc\nabc', '3'], ['abc\ndef', '0'], ['abcdef\nacf', '3']]
  },
  {
    title: '0-1背包', diff: 'HARD',
    desc: '<p>有 N 件物品和一个容量为 C 的背包。每件物品有重量和价值，求在不超过背包容量的前提下能装下的最大价值。</p>',
    inFmt: '第一行两个整数 N 和 C，接下来 N 行每行两个整数 w 和 v（重量和价值）。',
    outFmt: '一个整数，最大价值。',
    sampleIn: '3 5\n2 3\n1 2\n3 4', sampleOut: '7',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), c = sc.nextInt();\n        int[] w = new int[n], v = new int[n];\n        for (int i = 0; i < n; i++) { w[i] = sc.nextInt(); v[i] = sc.nextInt(); }\n        int[] dp = new int[c+1];\n        for (int i = 0; i < n; i++)\n            for (int j = c; j >= w[i]; j--)\n                dp[j] = Math.max(dp[j], dp[j-w[i]] + v[i]);\n        System.out.println(dp[c]);\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n, c;\n    cin >> n >> c;\n    int dp[1001] = {0};\n    for (int i = 0; i < n; i++) {\n        int w, v;\n        cin >> w >> v;\n        for (int j = c; j >= w; j--) dp[j] = max(dp[j], dp[j-w] + v);\n    }\n    cout << dp[c] << endl;\n    return 0;\n}',
      PYTHON: 'n, c = map(int, input().split())\ndp = [0] * (c + 1)\nfor _ in range(n):\n    w, v = map(int, input().split())\n    for j in range(c, w - 1, -1):\n        dp[j] = max(dp[j], dp[j - w] + v)\nprint(dp[c])'
    },
    tests: [['3 5\n2 3\n1 2\n3 4', '7'], ['2 3\n1 1\n2 2', '3'], ['4 10\n2 1\n3 2\n4 3\n5 4', '7']]
  },
  {
    title: '最长递增子序列', diff: 'HARD',
    desc: '<p>给定一个整数序列，求最长递增子序列（LIS）的长度。<br>子序列中的元素保持相对顺序且严格递增。</p>',
    inFmt: '第一行 N，第二行 N 个整数。',
    outFmt: '一个整数，LIS 的长度。',
    sampleIn: '6\n1 7 2 8 3 9', sampleOut: '4',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        int[] dp = new int[n];\n        int ans = 0;\n        Arrays.fill(dp, 1);\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < i; j++)\n                if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n            ans = Math.max(ans, dp[i]);\n        }\n        System.out.println(ans);\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int a[1000];\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int dp[1000], ans = 0;\n    fill(dp, dp + n, 1);\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < i; j++)\n            if (a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);\n        ans = max(ans, dp[i]);\n    }\n    cout << ans << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\na = list(map(int, input().split()))\ndp = [1] * n\nans = 1\nfor i in range(n):\n    for j in range(i):\n        if a[j] < a[i]: dp[i] = max(dp[i], dp[j] + 1)\n    ans = max(ans, dp[i])\nprint(ans)'
    },
    tests: [['6\n1 7 2 8 3 9', '4'], ['5\n5 4 3 2 1', '1'], ['4\n1 2 3 4', '4']]
  },
  {
    title: '大数加法', diff: 'HARD',
    desc: '<p>输入两个超大整数（可能超过 64 位整数范围），输出它们的和。</p>',
    inFmt: '两行，每行一个非负整数。',
    outFmt: '一行，两个数之和。',
    sampleIn: '99999999999999999999\n1', sampleOut: '100000000000000000000',
    code: {
      JAVA: 'import java.util.*;\nimport java.math.BigInteger;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        BigInteger a = new BigInteger(sc.nextLine());\n        BigInteger b = new BigInteger(sc.nextLine());\n        System.out.println(a.add(b));\n    }\n}',
      CPP: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    int i = a.size() - 1, j = b.size() - 1, carry = 0;\n    string res;\n    while (i >= 0 || j >= 0 || carry) {\n        int s = carry;\n        if (i >= 0) s += a[i--] - \'0\';\n        if (j >= 0) s += b[j--] - \'0\';\n        res += (char)(\'0\' + s % 10);\n        carry = s / 10;\n    }\n    reverse(res.begin(), res.end());\n    cout << res << endl;\n    return 0;\n}',
      PYTHON: 'a = input().strip()\nb = input().strip()\nprint(int(a) + int(b))'
    },
    tests: [['99999999999999999999\n1', '100000000000000000000'], ['123\n456', '579'], ['111111111111111111111111111111\n888888888888888888888888888889', '1000000000000000000000000000000']]
  },
  {
    title: 'N皇后问题', diff: 'HARD',
    desc: '<p>在 N×N 的棋盘上放置 N 个皇后，使它们互不攻击（不同行、不同列、不同对角线）。输出方案总数。</p>',
    inFmt: '一行，一个正整数 N（1 ≤ N ≤ 10）。',
    outFmt: '一个整数，方案数。',
    sampleIn: '8', sampleOut: '92',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    static int n, cnt = 0;\n    static boolean[] col, d1, d2;\n    static void dfs(int row) {\n        if (row == n) { cnt++; return; }\n        for (int c = 0; c < n; c++) {\n            if (col[c] || d1[row+c] || d2[row-c+n]) continue;\n            col[c] = d1[row+c] = d2[row-c+n] = true;\n            dfs(row+1);\n            col[c] = d1[row+c] = d2[row-c+n] = false;\n        }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        n = sc.nextInt();\n        col = new boolean[n]; d1 = new boolean[2*n]; d2 = new boolean[2*n];\n        dfs(0);\n        System.out.println(cnt);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint n, cnt = 0;\nbool col[11], d1[21], d2[21];\n\nvoid dfs(int row) {\n    if (row == n) { cnt++; return; }\n    for (int c = 0; c < n; c++) {\n        if (col[c] || d1[row+c] || d2[row-c+n]) continue;\n        col[c] = d1[row+c] = d2[row-c+n] = true;\n        dfs(row+1);\n        col[c] = d1[row+c] = d2[row-c+n] = false;\n    }\n}\n\nint main() {\n    cin >> n;\n    dfs(0);\n    cout << cnt << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\ncol = [False] * n\nd1 = [False] * (2 * n)\nd2 = [False] * (2 * n)\ncnt = 0\n\ndef dfs(row):\n    global cnt\n    if row == n:\n        cnt += 1\n        return\n    for c in range(n):\n        if col[c] or d1[row+c] or d2[row-c+n]: continue\n        col[c] = d1[row+c] = d2[row-c+n] = True\n        dfs(row + 1)\n        col[c] = d1[row+c] = d2[row-c+n] = False\n\ndfs(0)\nprint(cnt)'
    },
    tests: [['8', '92'], ['4', '2'], ['1', '1']]
  },
  {
    title: '表达式求值', diff: 'HARD',
    desc: '<p>给定一个只含数字和 +、-、* 运算符的表达式，求它的值。<br>运算符按数学优先级计算（先乘后加减）。</p>',
    inFmt: '一行，一个不含括号的表达式。',
    outFmt: '一个整数，表达式的结果。',
    sampleIn: '3+5*2', sampleOut: '13',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        Deque<Long> st = new ArrayDeque<>();\n        long num = 0; char op = \'+\';\n        for (int i = 0; i <= s.length(); i++) {\n            char c = i < s.length() ? s.charAt(i) : \'+\';\n            if (Character.isDigit(c)) num = num * 10 + (c - \'0\');\n            else {\n                if (op == \'+\') st.push(num);\n                else if (op == \'-\') st.push(-num);\n                else if (op == \'*\') st.push(st.pop() * num);\n                op = c; num = 0;\n            }\n        }\n        long ans = 0;\n        while (!st.isEmpty()) ans += st.pop();\n        System.out.println(ans);\n    }\n}',
      CPP: '#include <iostream>\n#include <stack>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    stack<long long> st;\n    long long num = 0;\n    char op = \'+\';\n    for (int i = 0; i <= (int)s.size(); i++) {\n        char c = i < (int)s.size() ? s[i] : \'+\';\n        if (isdigit(c)) num = num * 10 + (c - \'0\');\n        else {\n            if (op == \'+\') st.push(num);\n            else if (op == \'-\') st.push(-num);\n            else if (op == \'*\') { long long t = st.top(); st.pop(); st.push(t * num); }\n            op = c; num = 0;\n        }\n    }\n    long long ans = 0;\n    while (!st.empty()) { ans += st.top(); st.pop(); }\n    cout << ans << endl;\n    return 0;\n}',
      PYTHON: 's = input().strip()\nst = []\nnum = 0\nop = \'+\'\nfor c in s + \'+\':\n    if c.isdigit():\n        num = num * 10 + int(c)\n    else:\n        if op == \'+\': st.append(num)\n        elif op == \'-\': st.append(-num)\n        elif op == \'*\': st.append(st.pop() * num)\n        op = c\n        num = 0\nprint(sum(st))'
    },
    tests: [['3+5*2', '13'], ['1+2+3', '6'], ['2*3*4', '24'], ['10+5*2-3', '17']]
  },
  {
    title: '约瑟夫环', diff: 'HARD',
    desc: '<p>N 个人围成一圈，从第 1 个人开始报数，报到 K 的人出局，然后从下一个人重新报数。<br>求最后剩下的人的编号。</p>',
    inFmt: '一行，两个整数 N 和 K。',
    outFmt: '一个整数，最后剩下的人的编号（从 1 开始）。',
    sampleIn: '5 2', sampleOut: '3',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), k = sc.nextInt();\n        List<Integer> list = new ArrayList<>();\n        for (int i = 1; i <= n; i++) list.add(i);\n        int idx = 0;\n        while (list.size() > 1) {\n            idx = (idx + k - 1) % list.size();\n            list.remove(idx);\n        }\n        System.out.println(list.get(0));\n    }\n}',
      CPP: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, k;\n    cin >> n >> k;\n    vector<int> v(n);\n    for (int i = 0; i < n; i++) v[i] = i + 1;\n    int idx = 0;\n    while (v.size() > 1) {\n        idx = (idx + k - 1) % v.size();\n        v.erase(v.begin() + idx);\n    }\n    cout << v[0] << endl;\n    return 0;\n}',
      PYTHON: 'n, k = map(int, input().split())\npeople = list(range(1, n + 1))\nidx = 0\nwhile len(people) > 1:\n    idx = (idx + k - 1) % len(people)\n    people.pop(idx)\nprint(people[0])'
    },
    tests: [['5 2', '3'], ['7 3', '4'], ['1 1', '1']]
  },
  {
    title: '合并区间', diff: 'HARD',
    desc: '<p>给定 N 个区间 [l, r]，将重叠或相邻的区间合并，输出合并后的区间个数。</p>',
    inFmt: '第一行 N，接下来 N 行每行两个整数 l 和 r。',
    outFmt: '一个整数，合并后的区间个数。',
    sampleIn: '3\n1 3\n2 6\n8 10', sampleOut: '2',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[][] a = new int[n][2];\n        for (int i = 0; i < n; i++) { a[i][0] = sc.nextInt(); a[i][1] = sc.nextInt(); }\n        Arrays.sort(a, (x, y) -> x[0] - y[0]);\n        int cnt = 0, curR = Integer.MIN_VALUE;\n        for (int i = 0; i < n; i++) {\n            if (a[i][0] > curR) { cnt++; curR = a[i][1]; }\n            else curR = Math.max(curR, a[i][1]);\n        }\n        System.out.println(cnt);\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    pair<int,int> a[1000];\n    for (int i = 0; i < n; i++) cin >> a[i].first >> a[i].second;\n    sort(a, a + n);\n    int cnt = 0, curR = -1e9;\n    for (int i = 0; i < n; i++) {\n        if (a[i].first > curR) { cnt++; curR = a[i].second; }\n        else curR = max(curR, a[i].second);\n    }\n    cout << cnt << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\na = [list(map(int, input().split())) for _ in range(n)]\na.sort()\ncnt = 0\ncurR = -10**9\nfor l, r in a:\n    if l > curR: cnt += 1; curR = r\n    else: curR = max(curR, r)\nprint(cnt)'
    },
    tests: [['3\n1 3\n2 6\n8 10', '2'], ['2\n1 4\n4 5', '1'], ['3\n1 2\n3 4\n5 6', '3']]
  },
  {
    title: '滑动窗口最大值', diff: 'HARD',
    desc: '<p>给定一个数组和窗口大小 K，输出每个长度为 K 的窗口中的最大值。</p>',
    inFmt: '第一行两个整数 N 和 K，第二行 N 个整数。',
    outFmt: '一行，共 N-K+1 个整数，即每个窗口的最大值。',
    sampleIn: '8 3\n1 3 -1 -3 5 3 6 7', sampleOut: '3 3 5 5 6 7',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), k = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        Deque<Integer> dq = new ArrayDeque<>();\n        for (int i = 0; i < n; i++) {\n            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();\n            dq.addLast(i);\n            if (dq.peekFirst() <= i - k) dq.pollFirst();\n            if (i >= k - 1) System.out.print(a[dq.peekFirst()] + (i == n - 1 ? "" : " "));\n        }\n        System.out.println();\n    }\n}',
      CPP: '#include <iostream>\n#include <deque>\nusing namespace std;\n\nint main() {\n    int n, k;\n    cin >> n >> k;\n    int a[100000];\n    for (int i = 0; i < n; i++) cin >> a[i];\n    deque<int> dq;\n    for (int i = 0; i < n; i++) {\n        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();\n        dq.push_back(i);\n        if (dq.front() <= i - k) dq.pop_front();\n        if (i >= k - 1) cout << a[dq.front()] << (i == n - 1 ? "" : " ");\n    }\n    cout << endl;\n    return 0;\n}',
      PYTHON: 'from collections import deque\nn, k = map(int, input().split())\na = list(map(int, input().split()))\ndq = deque()\nans = []\nfor i in range(n):\n    while dq and a[dq[-1]] <= a[i]: dq.pop()\n    dq.append(i)\n    if dq[0] <= i - k: dq.popleft()\n    if i >= k - 1: ans.append(str(a[dq[0]]))\nprint(" ".join(ans))'
    },
    tests: [['8 3\n1 3 -1 -3 5 3 6 7', '3 3 5 5 6 7'], ['1 1\n5', '5'], ['4 2\n1 2 3 4', '2 3 4']]
  },
  {
    title: '爬楼梯', diff: 'HARD',
    desc: '<p>爬一个有 N 阶的楼梯，每次可以爬 1 阶或 2 阶，问有多少种不同的方法爬到顶。</p>',
    inFmt: '一行，一个正整数 N（1 ≤ N ≤ 50）。',
    outFmt: '一个整数，方法总数。',
    sampleIn: '4', sampleOut: '5',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n == 1) { System.out.println(1); return; }\n        long a = 1, b = 2;\n        for (int i = 3; i <= n; i++) { long t = a + b; a = b; b = t; }\n        System.out.println(b);\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n == 1) { cout << 1 << endl; return 0; }\n    long long a = 1, b = 2;\n    for (int i = 3; i <= n; i++) { long long t = a + b; a = b; b = t; }\n    cout << b << endl;\n    return 0;\n}',
      PYTHON: 'n = int(input())\nif n == 1: print(1); exit()\na, b = 1, 2\nfor _ in range(3, n + 1): a, b = b, a + b\nprint(b)'
    },
    tests: [['4', '5'], ['1', '1'], ['10', '89']]
  },
  {
    title: '判断有向图是否有环', diff: 'HARD',
    desc: '<p>给定一个有向图，判断是否存在环。<br>存在环输出 CYCLE，否则输出 ACYCLIC。</p>',
    inFmt: '第一行两个整数 N 和 M（节点编号 0 到 N-1），接下来 M 行每行两个整数 u 和 v（表示有向边 u→v）。',
    outFmt: 'CYCLE 或 ACYCLIC。',
    sampleIn: '4 4\n0 1\n1 2\n2 3\n3 0', sampleOut: 'CYCLE',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), m = sc.nextInt();\n        List<List<Integer>> g = new ArrayList<>();\n        for (int i = 0; i < n; i++) g.add(new ArrayList<>());\n        int[] indeg = new int[n];\n        for (int i = 0; i < m; i++) {\n            int u = sc.nextInt(), v = sc.nextInt();\n            g.get(u).add(v); indeg[v]++;\n        }\n        Queue<Integer> q = new LinkedList<>();\n        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);\n        int cnt = 0;\n        while (!q.isEmpty()) {\n            int u = q.poll(); cnt++;\n            for (int v : g.get(u)) if (--indeg[v] == 0) q.add(v);\n        }\n        System.out.println(cnt == n ? "ACYCLIC" : "CYCLE");\n    }\n}',
      CPP: '#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<int>> g(n);\n    vector<int> indeg(n, 0);\n    for (int i = 0; i < m; i++) {\n        int u, v;\n        cin >> u >> v;\n        g[u].push_back(v); indeg[v]++;\n    }\n    queue<int> q;\n    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);\n    int cnt = 0;\n    while (!q.empty()) {\n        int u = q.front(); q.pop(); cnt++;\n        for (int v : g[u]) if (--indeg[v] == 0) q.push(v);\n    }\n    cout << (cnt == n ? "ACYCLIC" : "CYCLE") << endl;\n    return 0;\n}',
      PYTHON: 'from collections import deque\nn, m = map(int, input().split())\ng = [[] for _ in range(n)]\nindeg = [0] * n\nfor _ in range(m):\n    u, v = map(int, input().split())\n    g[u].append(v)\n    indeg[v] += 1\nq = deque(i for i in range(n) if indeg[i] == 0)\ncnt = 0\nwhile q:\n    u = q.popleft(); cnt += 1\n    for v in g[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0: q.append(v)\nprint("ACYCLIC" if cnt == n else "CYCLE")'
    },
    tests: [['4 4\n0 1\n1 2\n2 3\n3 0', 'CYCLE'], ['4 3\n0 1\n0 2\n1 3', 'ACYCLIC'], ['3 0', 'ACYCLIC']]
  },
  {
    title: '第K大的数', diff: 'HARD',
    desc: '<p>给定 N 个整数，输出其中第 K 大的数（1 ≤ K ≤ N）。</p>',
    inFmt: '第一行两个整数 N 和 K，第二行 N 个整数。',
    outFmt: '一个整数，第 K 大的数。',
    sampleIn: '6 2\n3 1 4 1 5 9', sampleOut: '5',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), k = sc.nextInt();\n        Integer[] a = new Integer[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        Arrays.sort(a, (x, y) -> y - x);\n        System.out.println(a[k-1]);\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n, k;\n    cin >> n >> k;\n    int a[1000];\n    for (int i = 0; i < n; i++) cin >> a[i];\n    sort(a, a + n, greater<int>());\n    cout << a[k-1] << endl;\n    return 0;\n}',
      PYTHON: 'n, k = map(int, input().split())\na = list(map(int, input().split()))\na.sort(reverse=True)\nprint(a[k-1])'
    },
    tests: [['6 2\n3 1 4 1 5 9', '5'], ['5 1\n1 2 3 4 5', '5'], ['4 4\n2 8 4 6', '2']]
  },
  {
    title: '括号匹配', diff: 'HARD',
    desc: '<p>给定一个只含括号 ( ) [ ] { } 的字符串，判断括号是否正确匹配。</p>',
    inFmt: '一行，一个只含括号的字符串。',
    outFmt: '匹配输出 YES，否则输出 NO。',
    sampleIn: '{[()]}', sampleOut: 'YES',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        Deque<Character> st = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\' || c == \'[\' || c == \'{\') st.push(c);\n            else {\n                if (st.isEmpty()) { System.out.println("NO"); return; }\n                char t = st.pop();\n                if ((c == \')\' && t != \'(\') || (c == \']\' && t != \'[\') || (c == \'}\' && t != \'{\')) {\n                    System.out.println("NO"); return;\n                }\n            }\n        }\n        System.out.println(st.isEmpty() ? "YES" : "NO");\n    }\n}',
      CPP: '#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    stack<char> st;\n    for (char c : s) {\n        if (c == \'(\' || c == \'[\' || c == \'{\') st.push(c);\n        else {\n            if (st.empty()) { cout << "NO" << endl; return 0; }\n            char t = st.top(); st.pop();\n            if ((c == \')\' && t != \'(\') || (c == \']\' && t != \'[\') || (c == \'}\' && t != \'{\')) {\n                cout << "NO" << endl; return 0;\n            }\n        }\n    }\n    cout << (st.empty() ? "YES" : "NO") << endl;\n    return 0;\n}',
      PYTHON: 's = input().strip()\nst = []\nfor c in s:\n    if c in "([{": st.append(c)\n    else:\n        if not st: print("NO"); exit()\n        t = st.pop()\n        if (c == ")" and t != "(") or (c == "]" and t != "[") or (c == "}" and t != "{"):\n            print("NO"); exit()\nprint("YES" if not st else "NO")'
    },
    tests: [['{[()]}', 'YES'], ['{[(])}', 'NO'], ['([])', 'YES'], ['(', 'NO']]
  },
  {
    title: '全排列', diff: 'HARD',
    desc: '<p>输出 1 到 N 的所有排列，按字典序排列。</p>',
    inFmt: '一行，一个正整数 N（1 ≤ N ≤ 6）。',
    outFmt: '每行一个排列，数字之间用空格分隔。',
    sampleIn: '3', sampleOut: '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    static int n;\n    static boolean[] used;\n    static int[] perm;\n    static void dfs(int idx) {\n        if (idx == n) {\n            for (int i = 0; i < n; i++) System.out.print(perm[i] + (i == n-1 ? "" : " "));\n            System.out.println();\n            return;\n        }\n        for (int i = 1; i <= n; i++) {\n            if (used[i]) continue;\n            used[i] = true; perm[idx] = i;\n            dfs(idx+1);\n            used[i] = false;\n        }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        n = sc.nextInt();\n        used = new boolean[n+1];\n        perm = new int[n];\n        dfs(0);\n    }\n}',
      CPP: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) a[i] = i + 1;\n    do {\n        for (int i = 0; i < n; i++) cout << a[i] << (i == n-1 ? "" : " ");\n        cout << endl;\n    } while (next_permutation(a.begin(), a.end()));\n    return 0;\n}',
      PYTHON: 'from itertools import permutations\nn = int(input())\nfor p in permutations(range(1, n + 1)):\n    print(*p)'
    },
    tests: [['3', '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1'], ['2', '1 2\n2 1'], ['1', '1']]
  },
  {
    title: '最短路径', diff: 'HARD',
    desc: '<p>给定一个带权无向图和节点数，求从节点 0 到节点 N-1 的最短路径长度。<br>如果不可达输出 -1。</p>',
    inFmt: '第一行两个整数 N 和 M，接下来 M 行每行三个整数 u v w（边 u-v，权重 w）。',
    outFmt: '一个整数，最短路径长度；不可达输出 -1。',
    sampleIn: '4 4\n0 1 2\n0 2 5\n1 3 3\n2 3 1', sampleOut: '5',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), m = sc.nextInt();\n        long[][] d = new long[n][n];\n        for (int i = 0; i < n; i++) { Arrays.fill(d[i], Long.MAX_VALUE / 2); d[i][i] = 0; }\n        for (int i = 0; i < m; i++) {\n            int u = sc.nextInt(), v = sc.nextInt(), w = sc.nextInt();\n            d[u][v] = Math.min(d[u][v], w); d[v][u] = Math.min(d[v][u], w);\n        }\n        for (int k = 0; k < n; k++)\n            for (int i = 0; i < n; i++)\n                for (int j = 0; j < n; j++)\n                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];\n        System.out.println(d[0][n-1] >= Long.MAX_VALUE / 2 ? -1 : d[0][n-1]);\n    }\n}',
      CPP: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    long long d[101][101];\n    const long long INF = 1e18;\n    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) d[i][j] = (i == j ? 0 : INF);\n    for (int i = 0; i < m; i++) {\n        int u, v, w;\n        cin >> u >> v >> w;\n        d[u][v] = min(d[u][v], (long long)w);\n        d[v][u] = min(d[v][u], (long long)w);\n    }\n    for (int k = 0; k < n; k++)\n        for (int i = 0; i < n; i++)\n            for (int j = 0; j < n; j++)\n                if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];\n    cout << (d[0][n-1] >= INF ? -1 : d[0][n-1]) << endl;\n    return 0;\n}',
      PYTHON: 'n, m = map(int, input().split())\nINF = 10**18\nd = [[INF] * n for _ in range(n)]\nfor i in range(n): d[i][i] = 0\nfor _ in range(m):\n    u, v, w = map(int, input().split())\n    d[u][v] = min(d[u][v], w)\n    d[v][u] = min(d[v][u], w)\nfor k in range(n):\n    for i in range(n):\n        for j in range(n):\n            if d[i][k] + d[k][j] < d[i][j]: d[i][j] = d[i][k] + d[k][j]\nprint(d[0][n-1] if d[0][n-1] < INF else -1)'
    },
    tests: [['4 4\n0 1 2\n0 2 5\n1 3 3\n2 3 1', '5'], ['3 2\n0 1 1\n1 2 1', '2'], ['2 0', '-1']]
  },
  {
    title: '区间和查询', diff: 'HARD',
    desc: '<p>给定一个数组，回答 Q 次区间求和查询。使用前缀和快速计算。</p>',
    inFmt: '第一行两个整数 N 和 Q，第二行 N 个整数，接下来 Q 行每行两个整数 l 和 r（闭区间，从 1 开始）。',
    outFmt: 'Q 行，每行一个整数，对应区间的和。',
    sampleIn: '5 3\n1 2 3 4 5\n1 3\n2 5\n3 3', sampleOut: '6\n14\n3',
    code: {
      JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), q = sc.nextInt();\n        long[] pre = new long[n+1];\n        for (int i = 1; i <= n; i++) pre[i] = pre[i-1] + sc.nextLong();\n        for (int i = 0; i < q; i++) {\n            int l = sc.nextInt(), r = sc.nextInt();\n            System.out.println(pre[r] - pre[l-1]);\n        }\n    }\n}',
      CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, q;\n    cin >> n >> q;\n    long long pre[100001] = {0};\n    for (int i = 1; i <= n; i++) {\n        long long x;\n        cin >> x;\n        pre[i] = pre[i-1] + x;\n    }\n    while (q--) {\n        int l, r;\n        cin >> l >> r;\n        cout << pre[r] - pre[l-1] << endl;\n    }\n    return 0;\n}',
      PYTHON: 'n, q = map(int, input().split())\na = list(map(int, input().split()))\npre = [0]\nfor x in a: pre.append(pre[-1] + x)\nfor _ in range(q):\n    l, r = map(int, input().split())\n    print(pre[r] - pre[l - 1])'
    },
    tests: [['5 3\n1 2 3 4 5\n1 3\n2 5\n3 3', '6\n14\n3'], ['3 1\n10 20 30\n1 3', '60'], ['2 2\n5 5\n1 1\n2 2', '5\n5']]
  }
];
