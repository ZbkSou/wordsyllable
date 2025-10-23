#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
单词记忆工具 - 启动脚本
"""
import os
import sys

def check_requirements():
    """检查依赖是否安装"""
    try:
        import flask
        import flask_sqlalchemy
        import flask_jwt_extended
        import flask_cors
        import dotenv
        import requests
        import werkzeug
        import sqlalchemy
        print("✓ 所有依赖已安装")
        return True
    except ImportError as e:
        print(f"✗ 缺少依赖: {e}")
        print("\n请先安装依赖:")
        print("  pip install -r requirements.txt")
        return False


def check_env_file():
    """检查环境变量文件"""
    if not os.path.exists('.env'):
        print("⚠ 警告: .env 文件不存在")
        print("\n请创建 .env 文件，可以参考 config_example.env:")
        print("  1. 复制 config_example.env 为 .env")
        print("  2. 修改其中的配置（特别是 DEEPSEEK_API_KEY 和 JWT_SECRET_KEY）")
        print("\n将使用默认配置启动...\n")
        return False
    else:
        print("✓ .env 配置文件存在")
        return True


def main():
    """主函数"""
    print("=" * 60)
    print("单词记忆工具 - 启动服务器")
    print("=" * 60)
    print()
    
    # 检查依赖
    if not check_requirements():
        sys.exit(1)
    
    # 检查环境变量
    check_env_file()
    
    print()
    print("正在启动服务器...")
    print()
    
    # 导入并运行应用
    try:
        from app import app, init_db
        
        # 初始化数据库
        init_db()
        
        # 获取配置
        from dotenv import load_dotenv
        load_dotenv()
        
        host = os.getenv('FLASK_HOST', '0.0.0.0')
        port = int(os.getenv('FLASK_PORT', 5000))
        debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        
        print("=" * 60)
        print(f"服务器地址: http://{host}:{port}")
        print(f"调试模式: {debug}")
        print("=" * 60)
        print()
        print("API 端点:")
        print("  - POST   /api/auth/register     用户注册")
        print("  - POST   /api/auth/login        用户登录")
        print("  - GET    /api/auth/me           获取当前用户")
        print("  - POST   /api/words             添加单词")
        print("  - GET    /api/words             获取单词列表")
        print("  - GET    /api/words/search      搜索单词")
        print("  - GET    /api/words/<id>        获取单词详情")
        print("  - GET    /api/stats/words       单词查询统计")
        print("  - GET    /api/stats/syllables   音节查询统计")
        print("  - GET    /api/stats/overview    统计概览")
        print("  - GET    /api/health            健康检查")
        print("=" * 60)
        print()
        print("按 Ctrl+C 停止服务器")
        print()
        
        # 启动应用
        app.run(host=host, port=port, debug=debug)
        
    except Exception as e:
        print(f"\n✗ 启动失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

