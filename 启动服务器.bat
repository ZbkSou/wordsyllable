@echo off
chcp 65001 > nul
echo ============================================================
echo 单词记忆工具 - 启动服务器
echo ============================================================
echo.

REM 检查 Python 是否安装
python --version > nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查并激活虚拟环境
if exist venv\Scripts\activate.bat (
    echo [提示] 使用虚拟环境...
    call venv\Scripts\activate.bat
    echo ✓ 虚拟环境已激活
) else (
    echo [警告] 未找到虚拟环境
    echo.
    choice /C YN /M "是否现在创建虚拟环境（推荐）？"
    if errorlevel 2 goto :skip_venv
    if errorlevel 1 (
        call setup_venv.bat
        if errorlevel 1 (
            echo [错误] 虚拟环境创建失败
            pause
            exit /b 1
        )
        call venv\Scripts\activate.bat
    )
)

:skip_venv

REM 检查依赖是否安装
echo 检查依赖...
python -c "import flask" > nul 2>&1
if errorlevel 1 (
    echo.
    echo [提示] 正在安装依赖包...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查 .env 文件
if not exist .env (
    echo.
    echo [警告] .env 配置文件不存在
    echo 将从 config_example.env 复制...
    if exist config_example.env (
        copy config_example.env .env > nul
        echo [提示] 已创建 .env 文件，请编辑该文件配置 DEEPSEEK_API_KEY
    ) else (
        echo [错误] config_example.env 文件不存在
    )
    echo.
)

echo.
echo 正在启动服务器...
echo.
echo [提示] 按 Ctrl+C 可停止服务器
echo.

REM 启动服务器
python start_server.py

pause

