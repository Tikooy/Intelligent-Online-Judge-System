#!/bin/bash
echo "========================================"
echo " 智能在线判题系统 - 开发环境启动"
echo "========================================"
echo ""

# 环境变量（与 docker-compose.yml 默认值保持一致）
export MYSQL_PASSWORD="${MYSQL_PASSWORD:-root}"
export REDIS_PASSWORD="${REDIS_PASSWORD:-redispass}"
export JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32 2>/dev/null || echo dev-only-insecure-jwt-secret-change-me-in-production)}"
# 本地开发打印 MyBatis SQL，便于调试
export MYBATIS_LOG_IMPL="${MYBATIS_LOG_IMPL:-org.apache.ibatis.logging.stdout.StdOutImpl}"

# 1. 启动基础设施
echo "[1/4] 启动 MySQL + Redis..."
docker-compose up -d mysql redis

echo "等待 MySQL 就绪..."
sleep 15

# 2. SpringBoot
echo "[2/4] 启动 SpringBoot (端口 8080)..."
mvn spring-boot:run &
SPRING_PID=$!

# 3. Node.js
echo "[3/4] 启动 Node.js 判题引擎 (端口 3000)..."
(cd judge-engine && npm install && npm run dev) &
NODE_PID=$!

# 4. Vue
echo "[4/4] 启动 Vue 前端 (端口 5173)..."
(cd vue-frontend && npm install && npm run dev) &
VUE_PID=$!

echo ""
echo "========================================"
echo " 开发环境启动完成"
echo "   MySQL:    localhost:3306"
echo "   Redis:    localhost:6379"
echo "   SpringBoot: http://localhost:8080"
echo "   Judge:    ws://localhost:3000"
echo "   Vue:      http://localhost:5173"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "kill $SPRING_PID $NODE_PID $VUE_PID 2>/dev/null; docker-compose down" EXIT
wait
