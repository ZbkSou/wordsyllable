#!/bin/bash

###############################################
# 单词记忆工具 - 后端服务重启脚本
# 功能：停止现有服务并启动新服务
###############################################

# 获取脚本所在目录（项目根目录）
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="/tmp/word-api.log"
PID_FILE="/tmp/word-api.pid"

echo "========================================="
echo "    单词记忆工具 - 后端服务重启"
echo "========================================="
echo ""
echo "项目目录: $PROJECT_DIR"
echo ""

# 1. 停止现有服务
echo "[步骤 1/4] 停止现有服务..."

# 方法 1: 通过端口查找并关闭
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "  发现端口 5000 被占用，正在关闭..."
    kill $(lsof -ti:5000) 2>/dev/null
    sleep 2
    
    # 如果还在运行，强制关闭
    if lsof -ti:5000 > /dev/null 2>&1; then
        echo "  强制关闭..."
        kill -9 $(lsof -ti:5000) 2>/dev/null
        sleep 1
    fi
    echo "  ✓ 现有服务已停止"
else
    echo "  ✓ 没有发现运行中的服务"
fi

# 方法 2: 通过进程名关闭
pkill -f "gunicorn.*app:app" 2>/dev/null
sleep 1

echo ""

# 2. 检查是否完全停止
echo "[步骤 2/4] 验证服务已停止..."
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "  ✗ 端口仍被占用，无法启动新服务"
    echo "  请手动检查：lsof -i:5000"
    exit 1
else
    echo "  ✓ 端口 5000 已释放"
fi
echo ""

# 3. 启动新服务
echo "[步骤 3/4] 启动新服务..."
cd "$PROJECT_DIR"

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "  ✗ 虚拟环境不存在！"
    echo "  请先运行: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# 激活虚拟环境
source venv/bin/activate

# 检查gunicorn是否已安装
if ! command -v gunicorn &> /dev/null; then
    echo "  ✗ gunicorn 未安装！"
    echo "  正在安装 gunicorn..."
    pip install gunicorn
fi

# 启动 Gunicorn（后台运行）
nohup gunicorn -w 4 -b 127.0.0.1:5000 \
    --timeout 120 \
    --access-logfile "$LOG_FILE" \
    --error-logfile "$LOG_FILE" \
    --pid "$PID_FILE" \
    app:app > "$LOG_FILE" 2>&1 &

BACKEND_PID=$!
echo "  服务已启动，PID: $BACKEND_PID"
echo $BACKEND_PID > "$PID_FILE"

echo ""

# 4. 等待启动并验证
echo "[步骤 4/4] 验证服务状态..."
sleep 3

# 检查进程是否还在运行
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "  ✓ 进程运行正常"
else
    echo "  ✗ 进程启动失败"
    echo "  查看日志：cat $LOG_FILE"
    exit 1
fi

# 检查端口是否在监听
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "  ✓ 端口 5000 正在监听"
else
    echo "  ✗ 端口未监听"
    echo "  查看日志：cat $LOG_FILE"
    exit 1
fi

# 测试 API 响应
echo "  测试 API 响应..."
sleep 2
if curl -s http://127.0.0.1:5000/api/health > /dev/null 2>&1; then
    echo "  ✓ API 响应正常"
    HEALTH_CHECK=$(curl -s http://127.0.0.1:5000/api/health)
    echo "  响应内容: $HEALTH_CHECK"
else
    echo "  ⚠ API 暂时无响应（可能还在启动中或没有 /api/health 端点）"
    echo "  您可以尝试访问其他端点来验证服务是否正常"
fi

echo ""
echo "========================================="
echo "✓ 重启完成！"
echo "========================================="
echo ""
echo "服务信息："
echo "  PID:      $BACKEND_PID"
echo "  端口:     5000"
echo "  地址:     http://127.0.0.1:5000"
echo "  日志:     $LOG_FILE"
echo "  PID文件:  $PID_FILE"
echo ""
echo "常用命令："
echo "  查看日志:   tail -f $LOG_FILE"
echo "  查看进程:   ps aux | grep gunicorn"
echo "  停止服务:   kill $BACKEND_PID"
echo "  重启服务:   bash $PROJECT_DIR/restart-backend.sh"
echo ""


