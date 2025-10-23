# 快速开始指南

## 第一步：创建虚拟环境（推荐）

### Windows 用户

双击运行 `setup_venv.bat`，自动完成虚拟环境创建和依赖安装。

或者手动执行：
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### Linux/Mac 用户

```bash
# 运行安装脚本
chmod +x setup_venv.sh
./setup_venv.sh

# 或手动创建
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 不使用虚拟环境（不推荐）

如果不想使用虚拟环境，可以直接安装依赖：
```bash
pip install -r requirements.txt
```

> **💡 提示**：使用虚拟环境是 Python 最佳实践，可以隔离项目依赖，避免冲突。详见 `虚拟环境使用指南.md`

## 第二步：配置环境

1. 复制配置文件：
```bash
copy config_example.env .env
```

2. 编辑 `.env` 文件，修改以下配置：

```env
# 必须配置：Deepseek API 密钥
DEEPSEEK_API_KEY=sk-your-api-key-here

# 建议修改：JWT 密钥（生产环境必须修改）
JWT_SECRET_KEY=your-random-secret-key-12345

# 可选：其他配置保持默认即可
DATABASE_URL=sqlite:///word_memory.db
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=True
```

### 如何获取 Deepseek API Key？

1. 访问 [Deepseek 官网](https://www.deepseek.com/)
2. 注册账号并登录
3. 进入 API 管理页面
4. 创建 API Key 并复制到 `.env` 文件中

## 第三步：启动服务器

### Windows 用户

**方式A：一键启动（推荐）**

双击 `启动服务器.bat`，会自动：
- 激活虚拟环境（如果存在）
- 检查并安装依赖
- 启动服务器

**方式B：命令行启动**
```bash
# 如果使用虚拟环境，先激活
venv\Scripts\activate

# 启动服务器
python start_server.py
```

### Linux/Mac 用户

```bash
# 激活虚拟环境
source venv/bin/activate

# 启动服务器
python start_server.py
```

看到以下信息表示启动成功：

```
============================================================
单词记忆工具 - 启动服务器
============================================================

✓ 所有依赖已安装
✓ .env 配置文件存在

正在启动服务器...

数据库初始化完成！
============================================================
服务器地址: http://0.0.0.0:5000
调试模式: True
============================================================

API 端点:
  - POST   /api/auth/register     用户注册
  - POST   /api/auth/login        用户登录
  ...
============================================================

按 Ctrl+C 停止服务器
```

## 第四步：测试 API

### Windows 用户

双击 `测试API.bat`（会自动激活虚拟环境）

或手动运行：
```bash
# 激活虚拟环境（如果使用）
venv\Scripts\activate

# 运行测试
python test_api.py
```

### Linux/Mac 用户

```bash
# 激活虚拟环境
source venv/bin/activate

# 运行测试
python test_api.py
```

这将自动测试所有 API 功能，包括：
- 用户注册和登录
- 添加单词（手动和AI两种模式）
- 查询单词
- 统计功能

## 使用 API

### 1. 用户注册

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"myuser\",\"email\":\"my@email.com\",\"password\":\"mypass123\"}"
```

返回结果会包含 `access_token`，保存这个 token。

### 2. 添加单词（两种方式）

**方式A - 手动添加（适合已知音节的情况）**
```bash
curl -X POST http://localhost:5000/api/words \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d "{\"word\":\"conversation\",\"syllables\":[\"con\",\"ver\",\"sa\",\"tion\"],\"translation\":\"会话，谈话\",\"phonetic\":\"/ˌkɒnvəˈseɪʃən/\"}"
```

**方式B - AI自动获取（适合新单词）**
```bash
curl -X POST http://localhost:5000/api/words \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d "{\"word\":\"conversation\"}"
```

AI会自动获取音标、翻译和音节：
```json
{
  "phonetic": "/ˌkɒnvəˈseɪʃən/",
  "translation": "会话，谈话",
  "syllables": ["con", "ver", "sa", "tion"]
}
```

### 3. 查询单词

```bash
curl -X GET "http://localhost:5000/api/words/search?word=conversation" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

每次查询都会自动记录：
- 该用户查询这个单词的次数
- 该用户查询这个单词包含的音节的次数

### 4. 查看统计

```bash
# 单词查询统计
curl -X GET http://localhost:5000/api/stats/words \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 音节查询统计
curl -X GET http://localhost:5000/api/stats/syllables \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 统计概览
curl -X GET http://localhost:5000/api/stats/overview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 使用 Postman 测试

1. 下载并安装 [Postman](https://www.postman.com/downloads/)
2. 创建新请求
3. 设置请求类型（POST/GET）和 URL
4. 在 Headers 中添加 `Authorization: Bearer YOUR_TOKEN`
5. 在 Body 中选择 `raw` 和 `JSON` 格式
6. 输入 JSON 数据并发送

## 常见问题

### Q1: 提示 "缺少依赖" 怎么办？

**如果使用虚拟环境**：
```bash
# Windows
venv\Scripts\activate
pip install -r requirements.txt

# Linux/Mac
source venv/bin/activate
pip install -r requirements.txt
```

**如果不使用虚拟环境**：
```bash
pip install -r requirements.txt
```

### Q2: Deepseek API 调用失败？
检查：
1. `.env` 文件中的 `DEEPSEEK_API_KEY` 是否正确
2. 网络连接是否正常
3. API Key 是否有效且有剩余额度

**解决方案**：
- AI自动模式失败时，可以使用手动添加模式
- 手动模式不需要配置 API Key

### Q3: 端口被占用？
修改 `.env` 文件中的 `FLASK_PORT` 为其他端口，如 `5001`

### Q4: 如何停止服务器？
在服务器运行的命令行窗口按 `Ctrl+C`

### Q5: 数据库文件在哪里？
默认在项目目录下的 `word_memory.db` 文件

## 下一步

- 查看 `README.md` 了解完整的 API 文档
- 查看 `database_design.md` 了解数据库设计
- 修改 `app.py` 添加自定义功能
- 开发前端界面（Vue.js / React）

## 技术支持

如有问题，请查看：
1. 服务器运行日志（命令行输出）
2. `README.md` 完整文档
3. `test_api.py` 测试示例代码

