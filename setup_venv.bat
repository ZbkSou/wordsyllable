@echo off
chcp 65001 > nul
echo ============================================================
echo 单词记忆工具 - 虚拟环境初始化
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

echo [1/4] 检查虚拟环境...
if exist venv (
    echo [提示] 虚拟环境已存在
    choice /C YN /M "是否删除现有虚拟环境并重新创建？"
    if errorlevel 2 goto :skip_create
    if errorlevel 1 (
        echo [提示] 正在删除现有虚拟环境...
        rmdir /s /q venv
    )
)

echo [2/4] 创建虚拟环境...
python -m venv venv
if errorlevel 1 (
    echo [错误] 创建虚拟环境失败
    echo 请确保安装了 Python 的 venv 模块
    pause
    exit /b 1
)
echo [成功] 虚拟环境创建完成

:skip_create

echo.
echo [3/4] 激活虚拟环境并安装依赖...
call venv\Scripts\activate.bat

echo [提示] 升级 pip...
python -m pip install --upgrade pip

echo [提示] 安装项目依赖...
pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [4/4] 检查环境配置...
if not exist .env (
    echo [提示] 创建 .env 配置文件...
    if exist config_example.env (
        copy config_example.env .env > nul
        echo [成功] .env 文件已创建
    )
)

echo.
echo ============================================================
echo ✓ 虚拟环境配置完成！
echo ============================================================
echo.
echo 虚拟环境位置: %CD%\venv
echo Python 版本:
python --version
echo.
echo 下一步：
echo 1. 编辑 .env 文件，配置 DEEPSEEK_API_KEY
echo 2. 运行 "启动服务器.bat" 启动服务器
echo.
echo 注意：启动脚本会自动激活虚拟环境
echo ============================================================
pause

