# 单词记忆工具 API

一个基于音节分词的英语单词记忆工具后端API，使用 Deepseek AI 进行智能音节分词。

## 功能特性

1. **用户系统**
   - 用户注册和登录
   - JWT 令牌认证
   - 个人数据隔离

2. **单词管理**
   - 添加单词（支持手动添加和AI自动获取两种模式）
   - 手动模式：传入完整的单词信息（音节、翻译、音标）
   - AI自动模式：只传入单词，自动通过 Deepseek AI 获取音标、翻译和音节
   - 查询单词详情

3. **查询统计**
   - 记录每个用户对单词的查询次数
   - 记录每个用户对音节的查询次数
   - 提供统计报告和分析

4. **智能AI功能**
   - 集成 Deepseek AI API 进行智能音节分词
   - AI自动获取单词的音标、翻译和音节
   - 例如：conversation → 音标 /ˌkɒnvəˈseɪʃən/ + 翻译 "会话，谈话" + 音节 con ver sa tion
   - 支持手动添加模式，无需依赖AI

## 技术栈

- **后端框架**: Flask 3.0.0
- **数据库**: SQLite (可轻松切换到 PostgreSQL/MySQL)
- **ORM**: SQLAlchemy 2.0
- **认证**: JWT (Flask-JWT-Extended)
- **AI服务**: Deepseek API

## 数据库设计

### 数据表
- `users` - 用户信息
- `words` - 单词信息（单词、翻译、音标）
- `syllables` - 音节信息
- `word_syllables` - 单词和音节的关联
- `user_word_queries` - 用户查询单词的记录
- `user_syllable_queries` - 用户查询音节的记录

详细设计请查看 `database_design.md`，SQL 创建脚本请查看 `create_database.sql`

---

## 📋 快速参考

### 🚀 首次使用（三步走）

**Windows 用户：**
1. 双击 `setup_venv.bat` （创建虚拟环境）
2. 编辑 `.env` 文件（配置 DEEPSEEK_API_KEY）
3. 双击 `启动服务器.bat` （启动服务器）

**Linux/Mac 用户：**
```bash
./setup_venv.sh              # 1. 创建虚拟环境
# 编辑 .env 文件               # 2. 配置 API Key
source venv/bin/activate     # 3. 激活环境
python start_server.py       # 4. 启动服务器
```

### 📁 批处理文件速查

| 文件 | 用途 |
|------|------|
| **setup_venv.bat** | 🔧 初始化虚拟环境 |
| **启动服务器.bat** | ▶️ 启动服务器 |
| **测试API.bat** | 🧪 运行测试 |
| **激活虚拟环境.bat** | 🔌 进入虚拟环境命令行 |
| **清理虚拟环境.bat** | 🗑️ 删除虚拟环境 |

### 🌐 API 端点速查

| 方法 | 端点 | 功能 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户 |
| POST | `/api/words` | 添加单词（支持手动/AI自动） |
| POST | `/api/words/lookup` | 🌟智能查询（存在则查询，不存在则自动添加） |
| GET | `/api/words` | 获取单词列表 |
| GET | `/api/words/search?word=xxx` | 搜索单词 |
| GET | `/api/words/<id>` | 获取单词详情 |
| GET | `/api/stats/words` | 单词查询统计 |
| GET | `/api/stats/syllables` | 音节查询统计 |
| GET | `/api/stats/overview` | 统计概览 |
| GET | `/api/health` | 健康检查 |

### 📝 添加单词（两种方式）

**方式1 - 手动添加：**
```json
POST /api/words
Authorization: Bearer <token>

{
  "word": "conversation",
  "syllables": ["con", "ver", "sa", "tion"],
  "translation": "会话，谈话",
  "phonetic": "/ˌkɒnvəˈseɪʃən/"
}
```

**方式2 - AI自动获取：**
```json
POST /api/words
Authorization: Bearer <token>

{
  "word": "conversation"
}
```
AI 自动获取音标、翻译和音节。

### 🔑 快速认证示例

```python
import requests

# 1. 注册
response = requests.post('http://localhost:5000/api/auth/register', json={
    "username": "user",
    "email": "user@email.com",
    "password": "pass123"
})
token = response.json()['access_token']

# 2. 使用 token
headers = {"Authorization": f"Bearer {token}"}
response = requests.post('http://localhost:5000/api/words', 
                        headers=headers, 
                        json={"word": "hello"})
```

### 🔍 常见问题速查

| 问题 | 解决方案 |
|------|----------|
| 缺少依赖 | `pip install -r requirements.txt` |
| API Key 错误 | 检查 `.env` 文件中的 `DEEPSEEK_API_KEY` |
| 端口被占用 | 修改 `.env` 中的 `FLASK_PORT` |
| 虚拟环境损坏 | 删除 `venv` 文件夹，重新运行 `setup_venv.bat` |
| 单词已存在 | API 会返回已存在的单词信息 |

### 🔌 虚拟环境命令

**Windows:**
```bash
venv\Scripts\activate    # 激活
deactivate               # 退出
```

**Linux/Mac:**
```bash
source venv/bin/activate # 激活
deactivate               # 退出
```

---

## 快速开始

### 1. 创建虚拟环境（推荐）

**Windows 用户：**
```bash
# 双击运行
setup_venv.bat

# 或命令行运行
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Linux/Mac 用户：**
```bash
./setup_venv.sh

# 或手动创建
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> 💡 **推荐使用虚拟环境**：隔离项目依赖，避免冲突。详见 [虚拟环境使用指南](虚拟环境使用指南.md)

### 2. 配置环境变量

配置文件在虚拟环境创建时会自动生成，或手动复制：

```bash
# Windows
copy config_example.env .env

# Linux/Mac
cp config_example.env .env
```

编辑 `.env` 文件，配置以下重要参数：

```env
# Deepseek API 密钥（必须）
DEEPSEEK_API_KEY=your-deepseek-api-key

# JWT 密钥（建议修改）
JWT_SECRET_KEY=your-secret-key-change-this

# 数据库（可选，默认使用 SQLite）
DATABASE_URL=sqlite:///word_memory.db

# 服务器配置（可选）
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=True
```

### 3. 启动服务器

**Windows 用户：**
```bash
# 双击运行（推荐）
启动服务器.bat

# 或命令行运行
venv\Scripts\activate  # 激活虚拟环境
python start_server.py
```

**Linux/Mac 用户：**
```bash
source venv/bin/activate  # 激活虚拟环境
python start_server.py
```

服务器将在 `http://localhost:5000` 启动。

## API 接口文档

### 认证相关

#### 1. 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

响应：
```json
{
  "message": "注册成功",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

#### 2. 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

响应：
```json
{
  "message": "登录成功",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### 3. 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### 单词管理

#### 4. 添加单词（支持两种模式）

**模式1 - 手动添加**：传入完整信息
```http
POST /api/words
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "word": "conversation",
  "syllables": ["con", "ver", "sa", "tion"],
  "translation": "会话，谈话",
  "phonetic": "/ˌkɒnvəˈseɪʃən/"
}
```

**模式2 - AI自动获取**：只传入单词，AI自动获取音标、翻译和音节
```http
POST /api/words
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "word": "conversation"
}
```

响应（两种模式都返回）：
```json
{
  "message": "单词添加成功（手动添加/AI自动获取）",
  "word": {
    "id": 1,
    "word": "conversation",
    "translation": "会话，谈话",
    "phonetic": "/ˌkɒnvəˈseɪʃən/",
    "syllables": ["con", "ver", "sa", "tion"],
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**说明**：
- 手动模式：必须提供 `word`、`syllables`、`translation`，`phonetic` 可选
- AI自动模式：只需提供 `word`，系统自动通过 Deepseek AI 获取其他信息
- AI自动模式需要配置有效的 `DEEPSEEK_API_KEY`

#### 5. 智能查询单词（存在则查询，不存在则自动添加）🌟 新接口

```http
POST /api/words/lookup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "word": "conversation"
}
```

**功能说明**：
- 如果单词已存在：返回单词详情并记录查询次数
- 如果单词不存在：使用 AI 自动获取模式添加单词，然后返回详情

**响应示例 1 - 单词已存在**：
```json
{
  "message": "单词已存在",
  "action": "queried",
  "word": {
    "id": 1,
    "word": "conversation",
    "translation": "会话，谈话",
    "phonetic": "/ˌkɒnvəˈseɪʃən/",
    "syllables": ["con", "ver", "sa", "tion"],
    "query_count": 5,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**响应示例 2 - 单词不存在（已自动添加）**：
```json
{
  "message": "单词不存在，已自动添加（AI自动获取）",
  "action": "added",
  "word": {
    "id": 100,
    "word": "conversation",
    "translation": "会话，谈话",
    "phonetic": "/ˌkɒnvəˈseɪʃən/",
    "syllables": ["con", "ver", "sa", "tion"],
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**使用场景**：
- 用户查单词时自动添加到词库
- 快速学习新单词
- 减少手动添加操作

#### 6. 搜索单词（按单词文本）
```http
GET /api/words/search?word=conversation
Authorization: Bearer <access_token>
```

响应：
```json
{
  "word": {
    "id": 1,
    "word": "conversation",
    "translation": "对话，交谈",
    "phonetic": "/ˌkɒnvəˈseɪʃn/",
    "syllables": ["con", "ver", "sa", "tion"],
    "query_count": 5
  }
}
```

#### 7. 获取单词详情（按ID）
```http
GET /api/words/1
Authorization: Bearer <access_token>
```

#### 8. 获取单词列表
```http
GET /api/words?page=1&per_page=20
Authorization: Bearer <access_token>
```

响应：
```json
{
  "words": [...],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "pages": 5
}
```

### 统计相关

#### 9. 单词查询统计
```http
GET /api/stats/words?limit=50
Authorization: Bearer <access_token>
```

响应：
```json
{
  "stats": [
    {
      "id": 1,
      "user_id": 1,
      "word_id": 1,
      "word": "conversation",
      "query_count": 10,
      "last_queried_at": "2024-01-01T12:00:00"
    }
  ]
}
```

#### 10. 音节查询统计
```http
GET /api/stats/syllables?limit=50
Authorization: Bearer <access_token>
```

#### 11. 统计概览
```http
GET /api/stats/overview
Authorization: Bearer <access_token>
```

响应：
```json
{
  "overview": {
    "total_word_queries": 150,
    "unique_words_queried": 45,
    "total_syllable_queries": 600,
    "unique_syllables_queried": 120,
    "total_words_in_system": 500,
    "total_syllables_in_system": 800
  }
}
```

### 健康检查

#### 12. 健康检查
```http
GET /api/health
```

## 测试示例

查看 `test_api.py` 获取完整的 API 测试示例代码。

## 项目结构

```
11wordsyllable/
├── venv/                   # 虚拟环境文件夹（自动创建）
│
├── 核心代码
│   ├── app.py              # Flask 应用主文件
│   ├── models.py           # 数据库模型
│   ├── deepseek_service.py # Deepseek API 服务
│   └── start_server.py     # Python 启动脚本
│
├── 批处理工具（Windows）
│   ├── setup_venv.bat      # 创建虚拟环境
│   ├── 启动服务器.bat      # 启动服务器
│   ├── 测试API.bat         # 运行测试
│   ├── 激活虚拟环境.bat    # 激活环境
│   └── 清理虚拟环境.bat    # 清理环境
│
├── Shell 脚本（Linux/Mac）
│   ├── setup_venv.sh       # 创建虚拟环境
│   └── start_server.sh     # 启动服务器
│
├── 配置文件
│   ├── requirements.txt    # Python 依赖
│   ├── config_example.env  # 配置示例
│   ├── .env                # 实际配置（需创建）
│   └── .gitignore          # Git 忽略规则
│
├── 数据库
│   ├── database_design.md  # 数据库设计文档
│   └── create_database.sql # SQL 创建脚本
│
├── 文档
│   ├── README.md           # 项目文档（含快速参考）
│   ├── QUICK_START.md      # 快速开始指南
│   ├── 虚拟环境使用指南.md # 虚拟环境详解
│   └── API使用示例.md      # API 使用示例
│
└── 测试
    └── test_api.py         # API 测试脚本
```

## 注意事项

1. **虚拟环境**: 强烈建议使用虚拟环境，避免依赖冲突。详见 [虚拟环境使用指南](虚拟环境使用指南.md)
2. **Deepseek API Key**: 需要在 `.env` 文件中配置有效的 Deepseek API 密钥才能使用AI自动获取功能
3. **JWT Secret**: 生产环境中务必修改 `JWT_SECRET_KEY` 为安全的随机字符串
4. **数据库**: 默认使用 SQLite，生产环境建议使用 PostgreSQL 或 MySQL
5. **CORS**: 已启用 CORS，可从任何域访问 API（生产环境需要配置具体域名）

## 前端项目

前端项目位于 `word-next/` 目录，基于 Next.js 16 + React 19 + TypeScript 构建。

### 快速启动前端

**方法一：使用一键启动脚本（推荐）**

双击运行项目根目录下的 `启动完整项目.bat`（Windows）或 `./启动完整项目.sh`（Linux/Mac），自动启动后端和前端服务。

**方法二：单独启动前端**

```bash
# 进入前端目录
cd word-next

# Windows 用户
启动前端.bat

# Linux/Mac 用户
chmod +x 启动前端.sh
./启动前端.sh

# 或手动启动
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 使用前端应用。

### 前端功能特性

✨ **完整功能**
- 🔐 用户注册与登录（JWT 认证）
- 📝 添加单词（支持 AI 自动获取和手动添加两种模式）
- 🔍 单词搜索与列表浏览
- 📊 统计数据展示（概览、单词排行、音节排行）
- 🎨 现代化 UI，支持深色模式
- 📱 响应式设计，完美适配移动端

详细文档请查看 `word-next/README-CN.md`

## 开发计划

- [x] 前端界面开发 ✅
- [ ] 添加单词批量导入功能
- [ ] 添加音节练习功能
- [ ] 添加学习进度追踪
- [ ] 添加单词测验功能
- [ ] PWA 支持（离线使用）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

