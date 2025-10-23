#!/bin/bash

echo "============================================================"
echo "单词记忆工具 - 虚拟环境初始化"
echo "============================================================"
echo

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

echo "[1/4] 检查虚拟环境..."
if [ -d "venv" ]; then
    echo "[提示] 虚拟环境已存在"
    read -p "是否删除现有虚拟环境并重新创建？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "[提示] 正在删除现有虚拟环境..."
        rm -rf venv
    else
        echo "[跳过] 使用现有虚拟环境"
    fi
fi

if [ ! -d "venv" ]; then
    echo "[2/4] 创建虚拟环境..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[错误] 创建虚拟环境失败"
        echo "请确保安装了 Python 的 venv 模块"
        exit 1
    fi
    echo "[成功] 虚拟环境创建完成"
fi

echo
echo "[3/4] 激活虚拟环境并安装依赖..."
source venv/bin/activate

echo "[提示] 升级 pip..."
python -m pip install --upgrade pip

echo "[提示] 安装项目依赖..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[错误] 依赖安装失败"
    exit 1
fi

echo
echo "[4/4] 检查环境配置..."
if [ ! -f ".env" ]; then
    echo "[提示] 创建 .env 配置文件..."
    if [ -f "config_example.env" ]; then
        cp config_example.env .env
        echo "[成功] .env 文件已创建"
    fi
fi

echo
echo "============================================================"
echo "✓ 虚拟环境配置完成！"
echo "============================================================"
echo
echo "虚拟环境位置: $(pwd)/venv"
echo "Python 版本:"
python --version
echo
echo "下一步："
echo "1. 编辑 .env 文件，配置 DEEPSEEK_API_KEY"
echo "2. 运行 'source venv/bin/activate' 激活虚拟环境"
echo "3. 运行 'python start_server.py' 启动服务器"
echo
echo "提示："
echo "- 激活虚拟环境: source venv/bin/activate"
echo "- 退出虚拟环境: deactivate"
echo "============================================================"

