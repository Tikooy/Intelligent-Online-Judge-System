@echo off
echo ========================================
echo  智能在线判题系统 - 开发环境启动
echo ========================================
echo.
echo [1/4] 启动 MySQL + Redis...
docker-compose up -d mysql redis
echo.
echo 等待 MySQL 就绪...
timeout /t 15 /nobreak >nul
echo.
echo [2/4] 启动 SpringBoot (端口 8080)...
start "SpringBoot" cmd /c "mvn spring-boot:run"
echo.
echo [3/4] 启动 Node.js 判题引擎 (端口 3000)...
start "JudgeEngine" cmd /c "cd judge-engine && npm install && npm run dev"
echo.
echo [4/4] 启动 Vue 前端 (端口 5173)...
start "VueFrontend" cmd /c "cd vue-frontend && npm install && npm run dev"
echo.
echo ========================================
echo  开发环境启动中，请等待各窗口就绪：
echo    MySQL:    localhost:3306
echo    Redis:    localhost:6379
echo    SpringBoot: http://localhost:8080
echo    Judge:    ws://localhost:3000
echo    Vue:      http://localhost:5173
echo ========================================
pause
