#!/bin/bash

###############################################
# 单词记忆工具 - 停止后端服务
###############################################

echo "========================================="
echo "     停止后端服务"
echo "========================================="
echo ""

# 通过端口关闭
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "关闭端口 5000 的进程..."
    kill $(lsof -ti:5000) 2>/dev/null
    sleep 2
    
    # 强制关闭
    if lsof -ti:5000 > /dev/null 2>&1; then
        echo "强制关闭..."
        kill -9 $(lsof -ti:5000) 2>/dev/null
        sleep 1
    fi
fi

# 通过进程名关闭
pkill -f "gunicorn.*app:app" 2>/dev/null

sleep 1

# 验证
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "✗ 服务关闭失败，请手动检查："
    echo "  lsof -i:5000"
    exit 1
else
    echo "✓ 服务已成功停止"
fi

echo ""

