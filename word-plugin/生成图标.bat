@echo off
chcp 65001 >nul
echo ========================================
echo    单词记忆助手 - 图标生成工具
echo ========================================
echo.

:: 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Python！
    echo.
    echo 请先安装 Python 3.6+
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已安装
echo.

:: 检查 Pillow 是否安装
python -c "import PIL" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未检测到 Pillow 库
    echo.
    echo 正在安装 Pillow...
    pip install Pillow
    echo.
    if errorlevel 1 (
        echo ❌ Pillow 安装失败！
        echo.
        echo 请手动运行: pip install Pillow
        echo.
        pause
        exit /b 1
    )
    echo ✅ Pillow 安装成功
    echo.
)

:: 运行图标生成脚本
echo 🎨 开始生成图标...
echo.
python generate_icons.py

if errorlevel 1 (
    echo.
    echo ❌ 图标生成失败！
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 图标生成完成！
echo ========================================
echo.
echo 📁 图标位置: icons\
echo    - icon16.png
echo    - icon48.png
echo    - icon128.png
echo.
echo 下一步：
echo 1. 打开 Chrome: chrome://extensions/
echo 2. 开启 "开发者模式"
echo 3. 点击 "加载已解压的扩展程序"
echo 4. 选择 word-plugin 文件夹
echo.
pause

