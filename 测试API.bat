@echo off
chcp 65001 > nul
echo ============================================================
echo 单词记忆工具 - API 测试
echo ============================================================
echo.
echo [提示] 请确保服务器已经在运行
echo        如果还没启动，请先运行 "启动服务器.bat"
echo.
pause

REM 激活虚拟环境（如果存在）
if exist venv\Scripts\activate.bat (
    echo [提示] 激活虚拟环境...
    call venv\Scripts\activate.bat
)

echo 正在运行测试...
echo.

python test_api.py

echo.
echo ============================================================
echo 测试完成
echo ============================================================
pause

