# 智能查询 API 使用指南

## 📚 接口说明

`POST /api/words/lookup` 是一个智能查询接口，结合了查询和添加的功能：

- **如果单词已存在**：返回单词详情并记录查询次数（类似搜索功能）
- **如果单词不存在**：自动使用 AI 模式添加单词，然后返回详情

这个接口简化了用户的操作流程，特别适合学习新单词时使用。

---

## 🎯 使用场景

### 场景 1：学习新单词
用户在阅读文章时遇到生词，想要查询并保存到词库：

```javascript
// 前端代码
const lookupWord = async (word) => {
  const response = await wordsAPI.lookupWord({ word });
  
  if (response.data.action === 'added') {
    console.log('这是新单词，已自动添加到词库！');
  } else {
    console.log(`你已经查询过这个单词 ${response.data.word.query_count} 次了`);
  }
  
  // 显示单词详情
  showWordDetails(response.data.word);
};
```

### 场景 2：快速词库建立
在阅读过程中，遇到生词直接查询，系统自动建立个人词库：

```python
# Python 脚本批量处理
import requests

words_from_article = ["serendipity", "ephemeral", "resilience"]

for word in words_from_article:
    response = requests.post(
        'http://localhost:5000/api/words/lookup',
        headers={'Authorization': f'Bearer {token}'},
        json={'word': word}
    )
    
    result = response.json()
    print(f"{word}: {result['action']} - {result['word']['translation']}")
```

### 场景 3：浏览器插件集成
开发浏览器划词翻译插件，用户选中单词后自动查询和保存：

```javascript
// 浏览器插件代码
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'lookupWord') {
    fetch('http://localhost:5000/api/words/lookup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ word: request.word })
    })
    .then(res => res.json())
    .then(data => {
      // 显示弹出窗口
      showPopup(data.word);
    });
  }
});
```

---

## 📝 请求格式

### 端点
```
POST /api/words/lookup
```

### 请求头
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 请求体
```json
{
  "word": "conversation"
}
```

**字段说明**：
- `word`（必填）：要查询的单词，会自动转换为小写

---

## 📤 响应格式

### 情况 1：单词已存在

**HTTP 状态码**: `200 OK`

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

**字段说明**：
- `message`: 操作说明
- `action`: `"queried"` 表示单词已存在，执行了查询操作
- `word`: 单词详情对象
  - `query_count`: 该用户查询此单词的总次数（包含本次）

---

### 情况 2：单词不存在（已自动添加）

**HTTP 状态码**: `201 Created`

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

**字段说明**：
- `action`: `"added"` 表示单词不存在，已通过 AI 自动添加
- `word`: 新添加的单词详情

---

### 错误响应

**单词参数缺失**：
```json
{
  "error": "请提供单词"
}
```
**HTTP 状态码**: `400 Bad Request`

**AI 获取失败**：
```json
{
  "error": "AI自动获取单词信息失败",
  "message": "请检查 DEEPSEEK_API_KEY 配置或使用手动添加模式"
}
```
**HTTP 状态码**: `500 Internal Server Error`

**未授权**：
```json
{
  "msg": "Missing Authorization Header"
}
```
**HTTP 状态码**: `401 Unauthorized`

---

## 💻 代码示例

### JavaScript/TypeScript (前端)

```typescript
import { wordsAPI } from '@/lib/api';

// 查询单词
const handleLookup = async (word: string) => {
  try {
    const response = await wordsAPI.lookupWord({ word });
    
    if (response.data.action === 'queried') {
      // 单词已存在
      console.log(`单词已在词库中，你已查询过 ${response.data.word.query_count} 次`);
    } else {
      // 单词已自动添加
      console.log('新单词已自动添加到词库！');
    }
    
    // 显示单词信息
    const wordData = response.data.word;
    console.log(`${wordData.word}: ${wordData.translation}`);
    console.log(`音标: ${wordData.phonetic}`);
    console.log(`音节: ${wordData.syllables.join(' · ')}`);
    
  } catch (error) {
    console.error('查询失败:', error);
  }
};
```

---

### Python (后端/脚本)

```python
import requests

BASE_URL = "http://localhost:5000/api"

def lookup_word(word, token):
    """智能查询单词"""
    response = requests.post(
        f"{BASE_URL}/words/lookup",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={"word": word}
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        word_data = result['word']
        
        if result['action'] == 'queried':
            print(f"✓ 单词已存在，查询次数: {word_data['query_count']}")
        else:
            print(f"✓ 新单词已添加")
        
        print(f"  单词: {word_data['word']}")
        print(f"  翻译: {word_data['translation']}")
        print(f"  音标: {word_data['phonetic']}")
        print(f"  音节: {' · '.join(word_data['syllables'])}")
        
        return word_data
    else:
        print(f"✗ 查询失败: {response.json()}")
        return None

# 使用示例
token = "your_access_token"
lookup_word("conversation", token)
lookup_word("serendipity", token)
```

---

### cURL (命令行测试)

```bash
# 查询单词
curl -X POST http://localhost:5000/api/words/lookup \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word": "conversation"}'
```

---

## 🔄 与其他接口的对比

### vs `/api/words/search` (搜索接口)

| 特性 | `/api/words/search` (GET) | `/api/words/lookup` (POST) |
|------|---------------------------|----------------------------|
| 单词存在 | ✅ 返回详情并记录查询 | ✅ 返回详情并记录查询 |
| 单词不存在 | ❌ 返回 404 错误 | ✅ 自动添加单词 |
| 适用场景 | 已知单词在词库中 | 不确定单词是否在词库 |

### vs `/api/words` (添加接口)

| 特性 | `/api/words` (POST) | `/api/words/lookup` (POST) |
|------|---------------------|----------------------------|
| 单词存在 | ❌ 返回错误 | ✅ 返回详情 |
| 单词不存在 | ✅ 添加单词 | ✅ 添加单词 |
| 支持手动模式 | ✅ 是 | ❌ 仅 AI 自动模式 |
| 适用场景 | 主动添加单词 | 查询时顺便添加 |

---

## ⚠️ 注意事项

### 1. AI 依赖
此接口在添加新单词时使用 AI 自动模式，需要：
- ✅ 配置有效的 `DEEPSEEK_API_KEY`
- ✅ 网络连接正常
- ✅ API 配额充足

如果 AI 调用失败，会返回 500 错误。

### 2. 查询统计
- 只有在单词**已存在**时才会记录查询次数
- 新添加的单词不会立即有查询记录

### 3. 性能考虑
- 首次查询不存在的单词会调用 AI，响应较慢（2-5秒）
- 后续查询同一单词会直接返回，响应很快（<100ms）

### 4. 用户隔离
- 查询次数是**按用户**统计的
- 不同用户查询同一单词，各自独立计数

---

## 🎯 最佳实践

### 1. 错误处理
```typescript
try {
  const response = await wordsAPI.lookupWord({ word });
  // 处理成功
} catch (error) {
  if (error.response?.status === 500) {
    // AI 失败，提示用户手动添加
    showManualAddOption();
  } else if (error.response?.status === 401) {
    // Token 过期，重新登录
    redirectToLogin();
  } else {
    // 其他错误
    showErrorMessage(error.message);
  }
}
```

### 2. 加载状态
```typescript
const [loading, setLoading] = useState(false);

const handleLookup = async (word: string) => {
  setLoading(true);
  try {
    const response = await wordsAPI.lookupWord({ word });
    
    if (response.data.action === 'added') {
      // 新单词，显示"正在使用AI获取..."
      showSuccessMessage('新单词已添加到词库！');
    } else {
      showSuccessMessage('找到单词！');
    }
  } finally {
    setLoading(false);
  }
};
```

### 3. 结果展示
```typescript
const displayResult = (response) => {
  const { action, word } = response.data;
  
  // 根据 action 显示不同的 badge
  const badge = action === 'added' 
    ? <Badge color="green">新词</Badge>
    : <Badge color="blue">已学 {word.query_count} 次</Badge>;
  
  return (
    <WordCard>
      {badge}
      <h2>{word.word}</h2>
      <p>{word.phonetic}</p>
      <p>{word.translation}</p>
      <Syllables>{word.syllables.join(' · ')}</Syllables>
    </WordCard>
  );
};
```

---

## 🚀 未来改进

可能的功能扩展：
- [ ] 支持手动模式的智能查询
- [ ] 批量查询接口
- [ ] 缓存机制优化性能
- [ ] 支持模糊查询

---

## 📞 反馈

如果你在使用此接口时遇到问题，或有改进建议，欢迎：
- 📧 提交 Issue
- 💬 发起 Discussion
- 🔀 提交 Pull Request

祝使用愉快！📚✨

