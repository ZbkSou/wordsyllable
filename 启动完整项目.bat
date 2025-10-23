@echo off
chcp 65001 >nul
echo ================================================
echo   单词记忆助手 - 完整项目启动脚本
echo ================================================
echo.
echo 本脚本将依次启动：
echo   1. 后端 API 服务器 (端口 5000)
echo   2. 前端 Web 应用 (端口 3000)
echo.
echo ================================================
echo.

REM 检查虚拟环境
if not exist "venv\Scripts\activate.bat" (
    echo [错误] 未找到虚拟环境！
    echo [提示] 请先运行 setup_venv.bat 创建虚拟环境
    pause
    exit /b 1
)

REM 检查 .env 文件
if not exist ".env" (
    echo [警告] 未找到 .env 配置文件！
    echo [提示] 请确保已配置 DEEPSEEK_API_KEY
    if exist "config_example.env" (
        echo [提示] 正在复制示例配置文件...
        copy config_example.env .env
        echo [警告] 请编辑 .env 文件并配置 DEEPSEEK_API_KEY
        pause
    )
)

echo [步骤 1/2] 启动后端 API 服务器...
echo.
start "单词记忆助手 - 后端 API" cmd /k "call venv\Scripts\activate.bat && python start_server.py"

REM 等待后端启动
echo [等待] 等待后端服务启动...
timeout /t 5 /nobreak >nul

echo.
echo [步骤 2/2] 启动前端 Web 应用...
echo.
cd word-next

REM 检查前端依赖
if not exist "node_modules" (
    echo [提示] 检测到未安装前端依赖，正在安装...
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败！
        pause
        exit /b 1
    )
)

REM 检查前端环境变量
if not exist ".env.local" (
    echo [提示] 正在创建前端配置文件...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env.local
)

start "单词记忆助手 - 前端 Web" cmd /k "npm run dev"

cd ..

echo.
echo ================================================
echo   启动完成！
echo ================================================
echo.
echo   后端 API:  http://localhost:5000
echo   前端 Web:  http://localhost:3000
echo.
echo   请在浏览器中访问前端地址开始使用
echo.
echo   若要停止服务，请关闭对应的命令行窗口
echo ================================================
echo.

pause

