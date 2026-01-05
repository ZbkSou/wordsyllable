#!/bin/bash

###############################################
# 单词记忆工具 - 启动后端服务
###############################################

# 获取脚本所在目录（项目根目录）
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="/tmp/word-api.log"
PID_FILE="/tmp/word-api.pid"

echo "========================================="
echo "     启动后端服务"
echo "========================================="
echo ""
echo "项目目录: $PROJECT_DIR"
echo ""

# 检查端口是否被占用
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "✗ 端口 5000 已被占用！"
    echo "请先停止现有服务："
    echo "  bash $PROJECT_DIR/stop-backend.sh"
    echo "或使用重启脚本："
    echo "  bash $PROJECT_DIR/restart-backend.sh"
    exit 1
fi

cd "$PROJECT_DIR"

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "✗ 虚拟环境不存在！"
    echo "请先运行: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# 激活虚拟环境
source venv/bin/activate

# 检查gunicorn是否已安装
if ! command -v gunicorn &> /dev/null; then
    echo "✗ gunicorn 未安装！"
    echo "正在安装 gunicorn..."
    pip install gunicorn
fi

# 启动 Gunicorn（后台运行）
echo "正在启动服务..."
nohup gunicorn -w 4 -b 127.0.0.1:5000 \
    --timeout 120 \
    --access-logfile "$LOG_FILE" \
    --error-logfile "$LOG_FILE" \
    --pid "$PID_FILE" \
    app:app > "$LOG_FILE" 2>&1 &

BACKEND_PID=$!
echo "服务已启动，PID: $BACKEND_PID"
echo $BACKEND_PID > "$PID_FILE"

# 等待启动
sleep 3

# 验证
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "✓ 进程运行正常"
else
    echo "✗ 进程启动失败"
    echo "查看日志：cat $LOG_FILE"
    exit 1
fi

if lsof -ti:5000 > /dev/null 2>&1; then
    echo "✓ 端口 5000 正在监听"
else
    echo "✗ 端口未监听"
    exit 1
fi

echo ""
echo "========================================="
echo "✓ 启动完成！"
echo "========================================="
echo ""
echo "服务信息："
echo "  PID:      $BACKEND_PID"
echo "  端口:     5000"
echo "  地址:     http://127.0.0.1:5000"
echo "  日志:     $LOG_FILE"
echo ""
echo "查看日志: tail -f $LOG_FILE"
echo ""


