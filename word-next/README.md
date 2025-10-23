# 单词记忆助手 - Word Memory Assistant

A modern word memory tool frontend built with Next.js 16, React 19, and TypeScript.

基于 Next.js 16 + React 19 + TypeScript 构建的现代化单词记忆工具前端应用。

---

## ✨ Features / 功能特性

- 🔐 **User Authentication** - JWT-based login and registration / 基于 JWT 的登录注册
- 📝 **Word Management** - Add, search, and browse words / 添加、搜索和浏览单词
- 🤖 **AI Auto-fetch** - Automatic phonetics, translation, and syllables / AI 自动获取音标、翻译和音节
- ✏️ **Manual Mode** - Full control over word information / 手动添加模式，完全控制单词信息
- 📋 **JSON Mode** - Paste JSON data for quick import / JSON 模式，粘贴 JSON 数据快速导入
- 📊 **Statistics** - Query statistics and analytics / 查询统计和数据分析
- 🎨 **Modern UI** - Responsive design with dark mode support / 响应式设计，支持深色模式

---

## 🚀 Quick Start / 快速开始

### Method 1: Use the startup script / 方法一：使用启动脚本

**Windows:**
```bash
双击运行 启动前端.bat
# or
.\启动前端.bat
```

**Linux/Mac:**
```bash
chmod +x 启动前端.sh
./启动前端.sh
```

### Method 2: Manual start / 方法二：手动启动

1. **Install dependencies / 安装依赖**
```bash
npm install
```

2. **Create environment file / 创建环境变量文件**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

3. **Start development server / 启动开发服务器**
```bash
npm run dev
```

4. **Open your browser / 打开浏览器**

Visit [http://localhost:3000](http://localhost:3000)

---

## 📋 Prerequisites / 前置要求

Before starting the frontend, make sure the backend API is running:

启动前端前，请确保后端 API 服务已运行：

```bash
# Navigate to parent directory / 回到上级目录
cd ..

# Start backend server / 启动后端服务器
# Windows:
启动服务器.bat

# Linux/Mac:
source venv/bin/activate
python start_server.py
```

Backend API should be running on `http://localhost:5000`

后端 API 应该运行在 `http://localhost:5000`

---

## 📖 Documentation / 文档

For detailed documentation in Chinese, see [README-CN.md](./README-CN.md)

详细的中文文档请查看 [README-CN.md](./README-CN.md)

---

## 🛠️ Tech Stack / 技术栈

- **Framework**: Next.js 16.0.0
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios

---

## 📁 Project Structure / 项目结构

```
word-next/
├── app/
│   ├── page.tsx           # Main page / 主页面
│   ├── layout.tsx         # Root layout / 根布局
│   └── globals.css        # Global styles / 全局样式
├── components/
│   ├── AuthForm.tsx       # Login/Register form / 登录注册表单
│   ├── AddWord.tsx        # Add word component / 添加单词组件
│   ├── WordList.tsx       # Word list component / 单词列表组件
│   └── Statistics.tsx     # Statistics component / 统计组件
├── lib/
│   └── api.ts             # API client / API 接口封装
└── README-CN.md           # Chinese documentation / 中文文档
```

---

## 🎯 Usage / 使用方法

1. **Register / 注册**
   - Create a new account / 创建新账号
   
2. **Add Words / 添加单词**
   - Choose AI auto-fetch, manual, or JSON mode / 选择 AI 自动、手动或 JSON 模式
   
3. **Browse Words / 浏览单词**
   - Search and view your word list / 搜索和查看单词列表
   
4. **View Statistics / 查看统计**
   - Check query statistics / 查看查询统计数据

---

## 🌐 API Endpoints / API 接口

All API endpoints are defined in `lib/api.ts`:

所有 API 接口已在 `lib/api.ts` 中定义：

- Authentication: `/api/auth/register`, `/api/auth/login`
- Words: `/api/words`, `/api/words/search`
- Statistics: `/api/stats/overview`, `/api/stats/words`, `/api/stats/syllables`

---

## 🔧 Development / 开发

```bash
npm run dev    # Start development server / 启动开发服务器
npm run build  # Build for production / 构建生产版本
npm start      # Start production server / 启动生产服务器
npm run lint   # Run linter / 运行代码检查
```

---

## 📝 License / 许可证

MIT License

---

## 🤝 Contributing / 贡献

Issues and Pull Requests are welcome!

欢迎提交 Issue 和 Pull Request！
