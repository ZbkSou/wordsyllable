# 单词记忆助手 - 前端项目

这是一个基于 Next.js 15 + React 19 + TypeScript 构建的单词记忆工具前端应用。

## 功能特性

✨ **用户认证**
- 用户注册与登录
- JWT Token 认证
- 自动保存登录状态

📝 **单词管理**
- 🤖 AI 自动获取：只需输入单词，自动获取音标、翻译和音节
- ✏️ 手动添加：完全控制单词的所有信息
- 🔍 单词搜索：快速查找已添加的单词
- 📖 单词列表：分页浏览所有单词

📊 **统计分析**
- 查询统计概览
- 单词查询排行榜
- 音节查询排行榜
- 实时数据刷新

🎨 **现代化 UI**
- 响应式设计，支持移动端和桌面端
- 深色模式支持
- 流畅的动画过渡
- 优雅的渐变背景

## 技术栈

- **框架**: Next.js 16.0.0 (App Router)
- **UI 库**: React 19.2.0
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **HTTP 客户端**: Axios
- **状态管理**: React Hooks

## 快速开始

### 1. 安装依赖

```bash
cd word-next
npm install
```

### 2. 配置环境变量

在 `word-next` 目录下创建 `.env.local` 文件：

```env
# API 后端地址
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> 确保后端 API 服务已经启动在 `http://localhost:5000`

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
word-next/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面（包含所有功能）
│   └── globals.css         # 全局样式
├── components/
│   ├── AuthForm.tsx        # 登录/注册表单
│   ├── AddWord.tsx         # 添加单词组件
│   ├── WordList.tsx        # 单词列表组件
│   └── Statistics.tsx      # 统计数据组件
├── lib/
│   └── api.ts              # API 接口封装
├── .env.local              # 环境变量配置（需创建）
├── .env.local.example      # 环境变量示例
├── package.json            # 项目依赖
└── tsconfig.json           # TypeScript 配置
```

## 使用说明

### 首次使用

1. **注册账号**
   - 在登录页面点击"没有账号？立即注册"
   - 填写用户名、邮箱和密码
   - 注册成功后自动登录

2. **添加单词**
   - 点击"添加单词"标签
   - 选择添加模式：
     - **AI 自动获取**：只需输入单词，AI 会自动获取音标、翻译和音节
     - **手动添加**：手动填写所有信息

3. **查看单词**
   - 点击"单词列表"标签
   - 使用搜索框快速查找单词
   - 支持分页浏览

4. **查看统计**
   - 点击"统计数据"标签
   - 查看概览、单词统计、音节统计

### 三种添加模式对比

#### 🤖 AI 自动获取模式
**优点**：
- 只需输入单词，无需查字典
- 自动获取标准音标和翻译
- 音节划分准确
- 操作简单快捷

**适用场景**：
- 遇到生词，不知道如何划分音节
- 需要标准的发音和翻译
- 快速批量添加单词

**示例**：
```
输入：conversation
自动获取：
- 音标：/ˌkɒnvəˈseɪʃən/
- 翻译：会话，谈话
- 音节：con · ver · sa · tion
```

#### ✏️ 手动添加模式
**优点**：
- 完全控制单词信息
- 不依赖网络或 API
- 可自定义音节划分
- 速度更快

**适用场景**：
- 已有整理好的单词表
- 网络不稳定
- 需要自定义音节划分
- 特殊单词或专有名词

**示例**：
```
单词：conversation
音节：con ver sa tion（空格或逗号分隔）
翻译：会话，谈话
音标：/ˌkɒnvəˈseɪʃən/（可选）
```

#### 📋 JSON 模式（新功能）
**优点**：
- 支持复制粘贴 JSON 数据
- 快速批量添加
- 支持 AI 自动和手动两种格式
- 适合程序化处理

**适用场景**：
- 从其他系统导入数据
- API 返回的 JSON 数据
- 批量添加单词
- 与其他工具集成

**示例 1 - AI 自动模式**：
```json
{
  "word": "conversation"
}
```

**示例 2 - 手动模式**：
```json
{
  "word": "conversation",
  "syllables": ["con", "ver", "sa", "tion"],
  "translation": "会话，谈话",
  "phonetic": "/ˌkɒnvəˈseɪʃən/"
}
```

## API 接口

本前端项目需要配合后端 API 使用，所有接口已在 `lib/api.ts` 中封装：

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 单词接口
- `POST /api/words` - 添加单词（支持两种模式）
- `GET /api/words` - 获取单词列表（支持分页）
- `GET /api/words/search?word=xxx` - 搜索单词
- `GET /api/words/:id` - 获取单词详情

### 统计接口
- `GET /api/stats/overview` - 获取统计概览
- `GET /api/stats/words` - 获取单词查询统计
- `GET /api/stats/syllables` - 获取音节查询统计

## 开发说明

### 启动后端服务

在使用前端应用之前，需要先启动后端 API 服务：

```bash
# 在项目根目录（11wordsyllable/）
cd ..

# Windows 用户
启动服务器.bat

# Linux/Mac 用户
source venv/bin/activate
python start_server.py
```

### 本地开发

```bash
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
npm run start  # 启动生产服务器
npm run lint   # 运行代码检查
```

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `http://localhost:5000/api` |

## 特性说明

### 自动认证
- 使用 JWT Token 进行身份验证
- Token 自动保存在 localStorage
- 自动在请求头添加 Authorization
- Token 过期自动跳转到登录页

### 响应式设计
- 支持手机、平板、桌面端
- 自适应布局
- 触摸友好的交互

### 错误处理
- 友好的错误提示
- 网络错误自动重试提示
- 表单验证

### 性能优化
- 按需加载组件
- API 请求拦截器
- 状态缓存

## 常见问题

### 1. 无法连接后端 API
**问题**：页面显示网络错误或 CORS 错误

**解决方案**：
- 确保后端服务已启动（默认端口 5000）
- 检查 `.env.local` 中的 API 地址配置
- 确保后端已启用 CORS（后端已默认启用）

### 2. AI 自动获取失败
**问题**：添加单词时提示"AI 自动获取失败"

**解决方案**：
- 检查后端 `.env` 文件中的 `DEEPSEEK_API_KEY` 是否配置
- 检查网络连接
- 切换到手动添加模式

### 3. 登录状态丢失
**问题**：刷新页面后需要重新登录

**解决方案**：
- 检查浏览器是否禁用了 localStorage
- 清除浏览器缓存后重新登录
- 检查 Token 是否过期

### 4. 样式显示异常
**问题**：页面样式错乱或不显示

**解决方案**：
```bash
# 清除缓存并重新安装依赖
rm -rf node_modules .next
npm install
npm run dev
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

建议使用最新版本的现代浏览器以获得最佳体验。

## 后续改进计划

- [ ] 添加单词发音功能
- [ ] 支持批量导入单词
- [ ] 添加单词测验功能
- [ ] 学习进度追踪
- [ ] 生词本分类管理
- [ ] 导出单词列表
- [ ] PWA 支持（离线使用）
- [ ] 移动端 App

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提 Issue 或 Pull Request！

