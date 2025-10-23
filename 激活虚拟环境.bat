@echo off
chcp 65001 > nul

if exist venv\Scripts\activate.bat (
    echo ============================================================
    echo 激活虚拟环境
    echo ============================================================
    echo.
    echo 虚拟环境位置: %CD%\venv
    echo.
    echo 提示：
    echo   - 使用 deactivate 命令退出虚拟环境
    echo   - 在虚拟环境中运行 Python 命令会使用隔离的依赖
    echo.
    call venv\Scripts\activate.bat
) else (
    echo [错误] 虚拟环境不存在
    echo.
    echo 请先运行 "setup_venv.bat" 创建虚拟环境
    pause
)

