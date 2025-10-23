@echo off
chcp 65001 > nul
echo ============================================================
echo 清理虚拟环境
echo ============================================================
echo.
echo 警告：此操作将删除 venv 文件夹及其所有内容
echo.

if not exist venv (
    echo [提示] 虚拟环境不存在，无需清理
    pause
    exit /b 0
)

echo 虚拟环境位置: %CD%\venv
echo.
choice /C YN /M "确定要删除虚拟环境吗？"
if errorlevel 2 (
    echo [取消] 未删除虚拟环境
    pause
    exit /b 0
)

echo.
echo [提示] 正在删除虚拟环境...
rmdir /s /q venv
if errorlevel 1 (
    echo [错误] 删除失败，请手动删除 venv 文件夹
    pause
    exit /b 1
)

echo ✓ 虚拟环境已删除
echo.
echo 如需重新创建，请运行 "setup_venv.bat"
echo ============================================================
pause

