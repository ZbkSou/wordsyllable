#!/bin/bash

echo "============================================================"
echo "单词记忆工具 - 启动服务器"
echo "============================================================"
echo

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 检查并激活虚拟环境
if [ -f "venv/bin/activate" ]; then
    echo "[提示] 使用虚拟环境..."
    source venv/bin/activate
    echo "✓ 虚拟环境已激活"
else
    echo "[警告] 未找到虚拟环境"
    echo
    read -p "是否现在创建虚拟环境（推荐）？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash setup_venv.sh
        if [ $? -ne 0 ]; then
            echo "[错误] 虚拟环境创建失败"
            exit 1
        fi
        source venv/bin/activate
    fi
fi

# 检查依赖是否安装
echo "检查依赖..."
python -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo
    echo "[提示] 正在安装依赖包..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo
    echo "[警告] .env 配置文件不存在"
    echo "将从 config_example.env 复制..."
    if [ -f "config_example.env" ]; then
        cp config_example.env .env
        echo "[提示] 已创建 .env 文件，请编辑该文件配置 DEEPSEEK_API_KEY"
    else
        echo "[错误] config_example.env 文件不存在"
    fi
    echo
    echo "将使用默认配置启动..."
    echo
fi

echo
echo "正在启动服务器..."
echo
echo "[提示] 按 Ctrl+C 可停止服务器"
echo

# 启动服务器
python start_server.py

