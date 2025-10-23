# JSON 模式使用指南

## 📋 功能说明

JSON 模式是 AddWord 组件新增的第三种添加模式，支持通过粘贴 JSON 格式来快速添加单词。

---

## 🎯 使用方法

### 步骤

1. 进入"添加单词"页面
2. 点击"📋 JSON"标签
3. 在文本框中粘贴 JSON 格式的单词数据
4. 点击"解析并添加单词"按钮

---

## 📝 支持的 JSON 格式

### 格式 1：AI 自动模式

只需提供 `word` 字段，系统会自动调用 AI 获取其他信息。

```json
{
  "word": "conversation"
}
```

**结果**：
- 单词会被发送给 Deepseek AI
- 自动获取音标：`/ˌkɒnvəˈseɪʃən/`
- 自动获取翻译：`会话，谈话`
- 自动获取音节：`["con", "ver", "sa", "tion"]`

---

### 格式 2：手动模式

提供完整字段，直接添加单词信息。

```json
{
  "word": "conversation",
  "syllables": ["con", "ver", "sa", "tion"],
  "translation": "会话，谈话",
  "phonetic": "/ˌkɒnvəˈseɪʃən/"
}
```

**字段说明**：
- `word`（必填）：单词文本
- `syllables`（必填）：音节数组
- `translation`（必填）：中文翻译
- `phonetic`（可选）：国际音标

---

## ✨ 优势

### 1. 快速导入
- 从其他系统或工具复制 JSON 数据
- 直接粘贴，无需手动输入每个字段

### 2. 格式灵活
- 支持 AI 自动模式（简单）
- 支持手动模式（完整控制）
- 自动识别使用哪种模式

### 3. 批量友好
- 适合批量添加单词
- 可以编写脚本生成 JSON
- 与 API 数据直接对接

### 4. 容错处理
- JSON 格式错误会显示友好提示
- 缺少必填字段会给出明确提示
- 自动去除首尾空格

---

## 📚 使用场景

### 场景 1：从 API 导入单词

假设你从某个在线词典 API 获取了单词数据：

```json
{
  "word": "beautiful",
  "syllables": ["beau", "ti", "ful"],
  "translation": "美丽的",
  "phonetic": "/ˈbjuːtɪfl/"
}
```

直接粘贴到 JSON 模式即可添加。

---

### 场景 2：批量准备单词

你可以预先准备一个单词列表文件，然后逐个复制粘贴：

```json
{
  "word": "education"
}
```

```json
{
  "word": "important"
}
```

```json
{
  "word": "technology"
}
```

---

### 场景 3：从文档复制

如果你在 Markdown 或 Word 文档中整理了单词：

```markdown
## 单词列表

### conversation
- 音标：/ˌkɒnvəˈseɪʃən/
- 翻译：会话，谈话
- 音节：con, ver, sa, tion
```

可以快速转换为 JSON 格式：

```json
{
  "word": "conversation",
  "syllables": ["con", "ver", "sa", "tion"],
  "translation": "会话，谈话",
  "phonetic": "/ˌkɒnvəˈseɪʃən/"
}
```

---

## ⚠️ 注意事项

### 1. JSON 格式要求

❌ **错误示例**：
```json
{
  word: "conversation"  // 键名没有引号
  "translation": '会话'  // 使用了单引号
  "syllables": ["con", "ver", "sa", "tion"],  // 最后一项有逗号
}
```

✅ **正确示例**：
```json
{
  "word": "conversation",
  "translation": "会话",
  "syllables": ["con", "ver", "sa", "tion"]
}
```

### 2. 必填字段

**AI 自动模式**：
- ✅ 必须有 `word` 字段

**手动模式**：
- ✅ 必须有 `word` 字段
- ✅ 必须有 `syllables` 数组
- ✅ 必须有 `translation` 字段
- ⚪ `phonetic` 是可选的

### 3. 模式识别规则

系统通过以下规则自动识别模式：

```javascript
if (json 中包含 syllables 数组) {
  使用手动模式
  要求: word, syllables, translation
} else {
  使用 AI 自动模式
  要求: word
}
```

---

## 🔧 技术实现

### 核心代码片段

```typescript
const handleJsonSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // 1. 解析 JSON
    const jsonData = JSON.parse(jsonFormData.trim());
    
    // 2. 验证必需字段
    if (!jsonData.word) {
      setError('JSON 中缺少 word 字段');
      return;
    }
    
    // 3. 判断模式
    if (jsonData.syllables && Array.isArray(jsonData.syllables)) {
      // 手动模式
      if (!jsonData.translation) {
        setError('手动模式下，需要 translation 字段');
        return;
      }
      
      await wordsAPI.addWord({
        word: jsonData.word.toLowerCase().trim(),
        syllables: jsonData.syllables.map(s => s.trim()),
        translation: jsonData.translation.trim(),
        phonetic: jsonData.phonetic?.trim()
      });
    } else {
      // AI 自动模式
      await wordsAPI.addWord({
        word: jsonData.word.toLowerCase().trim()
      });
    }
    
    setSuccess('添加成功！');
    setJsonFormData('');
    onWordAdded();
  } catch (err) {
    if (err instanceof SyntaxError) {
      setError('JSON 格式错误');
    } else {
      setError(err.message);
    }
  }
};
```

---

## 💡 使用技巧

### 技巧 1：使用在线工具生成 JSON

可以使用在线工具快速生成 JSON：
- [JSON Editor Online](https://jsoneditoronline.org/)
- [JSON Formatter](https://jsonformatter.org/)

### 技巧 2：Excel/CSV 转 JSON

如果你有 Excel 单词表，可以：
1. 导出为 CSV
2. 使用在线工具转换为 JSON
3. 逐个粘贴到 JSON 模式

### 技巧 3：编写脚本批量生成

可以编写简单的 Python 脚本：

```python
import json

words = [
    {"word": "conversation"},
    {"word": "important"},
    {"word": "education"}
]

for word in words:
    print(json.dumps(word, indent=2))
    print()
```

---

## 🎉 总结

JSON 模式是一个强大且灵活的功能，特别适合：
- ✅ 从其他系统导入数据
- ✅ 批量添加单词
- ✅ 程序化处理
- ✅ 与 API 对接

结合 AI 自动模式和手动模式的优点，让单词添加更加高效！

---

## 📞 反馈

如果你在使用 JSON 模式时遇到问题，或有改进建议，欢迎：
- 📧 提交 Issue
- 💬 发起 Discussion
- 🔀 提交 Pull Request

祝使用愉快！📚✨

