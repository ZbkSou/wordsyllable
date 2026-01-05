# 快速安装指南

## 第一步：准备图标（必须）

由于 Chrome 插件必须包含图标，请选择以下任一方式：

### 方式 1：使用 emoji2png 在线工具（推荐，最快）

1. 访问 https://favicon.io/emoji-favicons/books/
2. 下载生成的图标包
3. 将其中的 `android-chrome-192x192.png` 重命名为 `icon128.png`
4. 使用图片编辑工具将其缩小为 48x48 和 16x16，分别保存为 `icon48.png` 和 `icon16.png`
5. 将三个文件放入 `word-plugin/icons/` 目录

### 方式 2：使用在线工具生成

访问 https://www.favicon-generator.org/
1. 上传任意图片或使用文字生成
2. 下载生成的图标包
3. 找到 16x16、48x48、128x128 的图标
4. 重命名并放入 `word-plugin/icons/` 目录

### 方式 3：使用 Python 脚本生成（推荐）

在 `word-plugin` 目录下运行：

```bash
python generate_icons.py
```

该脚本会自动生成三个所需的图标文件。

### 方式 4：临时使用任意图片

如果只是想快速测试功能：

1. 找任意一张图片（png 或 jpg）
2. 复制 3 份到 `icons` 目录
3. 分别重命名为 `icon16.png`、`icon48.png`、`icon128.png`

虽然尺寸不匹配，但插件可以正常使用。

## 第二步：加载插件到 Chrome

1. 打开 Chrome 浏览器
2. 地址栏输入：`chrome://extensions/`
3. 开启右上角的 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择 `word-plugin` 文件夹
6. 完成！

## 第三步：启动后端服务

### Windows 用户：
```bash
# 在项目根目录
双击运行 "启动服务器.bat"
```

### Linux/Mac 用户：
```bash
# 在项目根目录
bash restart-backend.sh
```

确认服务运行：访问 http://localhost:5000/api/health

## 第四步：开始使用

1. 点击 Chrome 右上角的插件图标（📚）
2. 注册或登录账号
3. 在任意网页选中英文单词
4. 右键选择"添加单词到记忆工具"
5. 享受学习！

## 常见问题

**Q: 插件加载失败，提示缺少图标？**  
A: 请确保 `icons` 目录下有 `icon16.png`、`icon48.png`、`icon128.png` 三个文件。

**Q: 登录失败？**  
A: 检查后端服务是否运行，访问 http://localhost:5000/api/health 测试。

**Q: 右键菜单看不到"添加单词"选项？**  
A: 刷新网页后重试，或重新加载插件。

---

如有其他问题，请查看 `README.md` 获取详细文档。


