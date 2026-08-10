# 基于微服务架构的智能在线判题系统

> 一个支持 Java、C++、Python 的在线代码评测平台，采用 SpringBoot + Node.js + Vue3 微服务架构。

## 功能模块

- **用户管理** — 注册/登录（JWT 认证）、权限分级（普通用户/管理员）、登录防爆破限流
- **题库管理** — 内置 50 道题（简单 17 / 中等 17 / 困难 16）、题目 CRUD、分页模糊搜索、测试用例管理
- **代码提交与判题** — Monaco Editor 在线编写代码（Java/C++/Python），提交至 Node.js 判题引擎，Docker 沙箱隔离执行
- **实时判题反馈** — WebSocket 推送判题进度（编译中 → 运行中 → 通过/报错），断线自动重连，重连失败自动转接口查询兜底
- **参考代码** — 每道题内置三语言官方题解，提交代码后可在"答案示例"查看（仅登录用户）
- **排行榜** — 通过率排名（窗口函数实时计算）
- **个人主页** — 提交统计、通过率、排名、最近记录
- **管理仪表盘** — 管理员登录后可见：平台运营概览（用户/提交/题目/测试用例数、整体通过率、待判队列）、题库质量（难度分布、最热门/最易错题目 Top5、缺参考代码/测试用例的题目数）、判题健康度（语言/状态分布、平均判题耗时）、最近新增题目
- **管理后台** — 管理员在线管理题目与测试用例（增删改查、批量上传测试用例）

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Spring Boot 3.3、MyBatis-Plus、Spring Security、JWT、MySQL 8.0 |
| 判题引擎 | Node.js、Express、Dockerode、WebSocket (ws) |
| 前端 | Vue 3 (script setup)、Pinia、Vue Router、Monaco Editor、Vite |
| 消息队列 | Redis |
| 沙箱 | Docker 容器（128MB / 0.3 CPU / 无网络 / 只读根文件系统 / 限制进程数与特权） |
| 部署 | Docker Compose、Nginx |

## 架构

```
Browser (Vue3) ──REST──▶ SpringBoot (CRUD + Auth)
                            │
                            ▼ Redis Queue "queue:submissions"
                            │
Browser (Vue3) ──WebSocket─▶ Node.js Judge Engine
                               │ 编译 (Docker)
                               │ 逐测试点运行 (Docker sandbox)
                               │ 输出比对
                               │ 结果写入 MySQL
                               │ 进度推送 WebSocket
```

- SpringBoot 负责业务逻辑（用户、题库、提交记录）
- Node.js 独立判题服务，通过 Redis 队列异步解耦
- 判题结果由 Node.js 直接写入 MySQL，无需回调 SpringBoot
- 前端通过 WebSocket 连接判题服务（开发走 Vite 代理、生产走 Nginx 转发），一次性 token 认证

## 快速开始

### 环境要求

- JDK 17
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose
- MySQL 8.0 / Redis 7（可走 Docker）

### 开发环境（Windows）

```bat
start-dev.bat
```

### 开发环境（Linux/Mac）

```bash
chmod +x start-dev.sh
./start-dev.sh
```

脚本按顺序启动：MySQL + Redis（Docker）→ SpringBoot → Node.js → Vue。脚本会自动生成 `JWT_SECRET` 并传递数据库/Redis 密码等环境变量。

服务地址：
- 前端：http://localhost:5173
- SpringBoot：http://localhost:8080
- Node.js：ws://localhost:3000

### 生产部署

```bash
# 1. 构建判题沙箱镜像（仅首次）
docker build -t judge-sandbox:latest -f judge-engine/Dockerfile.sandbox judge-engine/

# 2. 设置必需环境变量（JWT 密钥必须显式提供，否则 docker-compose 会拒绝启动）
export JWT_SECRET=$(openssl rand -hex 32)
# 可选：自定义数据库 / Redis 密码（默认 MYSQL_PASSWORD=root，REDIS_PASSWORD=redispass）

# 3. 一键启动全部服务
docker-compose up -d --build

# 4. 访问 http://localhost
```

> 首次启动时 MySQL 容器会自动执行 `init.sql`，完成建库、建表并写入预置账号（`admin/admin123`、`test/123456`）与 3 道示例题目。完整 50 道题库（简单 17 / 中等 17 / 困难 16）通过 `judge-engine/scripts/seed-problems.js` 脚本批量导入。数据库与 Redis 端口默认仅绑定本机回环地址（127.0.0.1）。

## 项目结构

```
intelligent_grading/
├── pom.xml                          # Maven 依赖配置
├── src/main/java/com/intelligentgrading/
│   ├── config/                      # Security、Redis、MyBatis-Plus 配置
│   ├── common/                      # 通用类（Result、JWT、异常处理）
│   ├── entity/                      # 数据库实体（5 张表）
│   ├── mapper/                      # MyBatis-Plus Mapper
│   ├── dto/                         # 请求/响应 DTO（16 个）
│   ├── service/                     # 业务逻辑接口
│   │   └── impl/                    # 业务逻辑实现
│   └── controller/                  # REST API 控制器（7 个）
├── judge-engine/                    # Node.js 判题引擎
│   ├── src/
│   │   ├── index.js                 # Express 入口
│   │   ├── worker.js                # Redis 队列消费者（多并发 + 卡 PENDING 自动恢复）
│   │   ├── judge/                   # 判题核心（编译/运行/比对/工作目录管理）
│   │   ├── docker/                  # Docker 容器管理（沙箱加固）
│   │   ├── websocket/               # WebSocket 连接管理（归属校验）
│   │   └── db/                      # MySQL 结果写入
│   ├── scripts/                     # 题库数据（data-easy/medium/hard）+ 批量导入/验证脚本
│   ├── Dockerfile                   # 判题服务镜像
│   └── Dockerfile.sandbox           # 判题沙箱镜像
├── vue-frontend/                    # Vue3 前端
│   ├── src/
│   │   ├── views/                   # 页面组件（10 个，含管理后台/404）
│   │   ├── components/              # 可复用组件（代码编辑器/判题状态/导航栏/管理仪表盘/头像）
│   │   ├── stores/                  # Pinia 状态管理
│   │   ├── router/                  # Vue Router 配置
│   │   └── api/                     # Axios 封装
│   └── nginx.conf                   # 生产环境 Nginx 配置
├── docker-compose.yml               # 5 服务编排
├── Dockerfile.springboot
├── start-dev.bat / start-dev.sh     # 开发环境启动脚本
├── init.sql                          # 数据库初始化脚本（建库建表 + 预置数据）
└── src/main/resources/
    └── application.yml
```

## API 概览

| Method | Path | Auth | 说明 |
|--------|------|------|------|
| POST | /api/auth/register | 公开 | 注册 |
| POST | /api/auth/login | 公开 | 登录 |
| GET | /api/auth/me | JWT | 当前用户信息 |
| GET | /api/problems | 公开 | 题目列表（分页+搜索+难度筛选） |
| GET | /api/problems/{id} | 公开 | 题目详情（参考代码仅登录用户可见） |
| POST | /api/submissions | JWT | 提交代码 |
| GET | /api/submissions/{id} | JWT | 提交详情（含测试点结果，仅本人/管理员） |
| GET | /api/submissions | JWT | 我的提交记录（分页 page/size） |
| GET | /api/ranking | 公开 | 排行榜 |
| GET | /api/users/{id}/stats | JWT | 个人统计 |
| GET | /api/admin/dashboard | ADMIN | 管理仪表盘聚合数据（运营概览/题库质量/判题健康度） |
| POST | /api/admin/problems | ADMIN | 新增题目 |
| PUT | /api/admin/problems/{id} | ADMIN | 编辑题目 |
| DELETE | /api/admin/problems/{id} | ADMIN | 删除题目 |
| POST | /api/admin/problems/{id}/test-cases | ADMIN | 批量上传测试用例 |

## 数据库表

| 表 | 说明 |
|----|------|
| user | 用户（用户名、密码哈希、角色） |
| problem | 题目（标题、描述、难度、样例、三语言参考代码） |
| test_case | 测试用例（输入、预期输出、时间/内存限制、是否样例） |
| submission | 提交记录（代码、语言、状态、总耗时/内存） |
| submission_detail | 判题详情（每测试点的结果、耗时、实际输出） |

## 判题状态流转

```
PENDING → COMPILING → RUNNING → ACCEPTED / WRONG_ANSWER
                               → COMPILE_ERROR
                               → RUNTIME_ERROR
                               → TIME_LIMIT_EXCEEDED
                               → MEMORY_LIMIT_EXCEEDED
                               → SYSTEM_ERROR
```

样例测试点优先执行，样例不过则立即终止，隐藏用例标记 SKIPPED。判题引擎崩溃或任务丢失时，卡在 PENDING 的提交会在数分钟内被自动重新入队恢复。

## License

MIT
