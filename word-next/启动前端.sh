#!/bin/bash

echo "================================"
echo "  单词记忆助手 - 前端启动脚本"
echo "================================"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "[提示] 检测到未安装依赖，正在安装..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败！"
        exit 1
    fi
    echo "[成功] 依赖安装完成！"
    echo ""
fi

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "[警告] 未找到 .env.local 文件"
    echo "[提示] 正在创建默认配置..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    echo "[成功] 已创建 .env.local 文件"
    echo ""
fi

echo "[启动] 正在启动开发服务器..."
echo "[提示] 请确保后端 API 服务已启动（默认端口 5000）"
echo "[提示] 前端将在 http://localhost:3000 启动"
echo ""
echo "按 Ctrl+C 可停止服务器"
echo "================================"
echo ""

npm run dev

