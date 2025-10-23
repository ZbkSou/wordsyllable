# API 使用示例

## 两种添加单词的方式

本系统支持两种添加单词的方式：**手动添加**和**AI自动获取**。

---

## 方式一：手动添加

**适用场景**：
- 你已经知道单词的音节划分
- 你有准确的音标和翻译
- 不依赖 AI API，速度更快
- 网络不稳定或没有配置 Deepseek API Key

### 请求示例

```json
POST /api/words
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "word": "conversation",
  "syllables": ["con", "ver", "sa", "tion"],
  "translation": "会话，谈话",
  "phonetic": "/ˌkɒnvəˈseɪʃən/"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| word | string | ✓ | 单词（小写） |
| syllables | array | ✓ | 音节数组 |
| translation | string | ✓ | 中文翻译 |
| phonetic | string | ✗ | 国际音标（可选） |

### 响应示例

```json
{
  "message": "单词添加成功（手动添加）",
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

### Python 代码示例

```python
import requests

url = "http://localhost:5000/api/words"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}

data = {
    "word": "conversation",
    "syllables": ["con", "ver", "sa", "tion"],
    "translation": "会话，谈话",
    "phonetic": "/ˌkɒnvəˈseɪʃən/"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

### JavaScript 代码示例

```javascript
const url = 'http://localhost:5000/api/words';
const token = 'YOUR_ACCESS_TOKEN';

const data = {
  word: 'conversation',
  syllables: ['con', 'ver', 'sa', 'tion'],
  translation: '会话，谈话',
  phonetic: '/ˌkɒnvəˈseɪʃən/'
};

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## 方式二：AI自动获取

**适用场景**：
- 遇到新单词，不知道如何划分音节
- 需要准确的音标和翻译
- 配置了 Deepseek API Key
- 想要快速添加大量单词

### 请求示例

```json
POST /api/words
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "word": "conversation"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| word | string | ✓ | 单词（小写） |

**注意**：只需要传入单词，系统会自动调用 Deepseek AI 获取音标、翻译和音节。

### 响应示例

```json
{
  "message": "单词添加成功（AI自动获取）",
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

### Python 代码示例

```python
import requests

url = "http://localhost:5000/api/words"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}

data = {
    "word": "conversation"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

if response.status_code == 201:
    word_data = result['word']
    print(f"单词: {word_data['word']}")
    print(f"音标: {word_data['phonetic']}")
    print(f"翻译: {word_data['translation']}")
    print(f"音节: {' '.join(word_data['syllables'])}")
```

### JavaScript 代码示例

```javascript
const url = 'http://localhost:5000/api/words';
const token = 'YOUR_ACCESS_TOKEN';

const data = {
  word: 'conversation'
};

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => {
  const word = data.word;
  console.log(`单词: ${word.word}`);
  console.log(`音标: ${word.phonetic}`);
  console.log(`翻译: ${word.translation}`);
  console.log(`音节: ${word.syllables.join(' ')}`);
});
```

---

## 批量添加示例

### 手动批量添加

```python
import requests

url = "http://localhost:5000/api/words"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}

words_data = [
    {
        "word": "conversation",
        "syllables": ["con", "ver", "sa", "tion"],
        "translation": "会话，谈话",
        "phonetic": "/ˌkɒnvəˈseɪʃən/"
    },
    {
        "word": "important",
        "syllables": ["im", "por", "tant"],
        "translation": "重要的",
        "phonetic": "/ɪmˈpɔːtnt/"
    },
    {
        "word": "education",
        "syllables": ["ed", "u", "ca", "tion"],
        "translation": "教育",
        "phonetic": "/ˌedʒuˈkeɪʃn/"
    }
]

for word_data in words_data:
    response = requests.post(url, headers=headers, json=word_data)
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✓ {word_data['word']} 添加成功")
    else:
        print(f"✗ {word_data['word']} 添加失败: {response.json()}")
```

### AI自动批量添加

```python
import requests
import time

url = "http://localhost:5000/api/words"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}

words_list = ["conversation", "important", "education", "beautiful", "computer"]

for word in words_list:
    data = {"word": word}
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        result = response.json()
        word_data = result['word']
        print(f"✓ {word} 添加成功")
        print(f"  音节: {' '.join(word_data['syllables'])}")
    else:
        print(f"✗ {word} 添加失败: {response.json()}")
    
    # 避免 API 频率限制
    time.sleep(1)
```

---

## 错误处理

### 单词已存在

```json
{
  "message": "单词已存在",
  "word": {
    "id": 1,
    "word": "conversation",
    "translation": "会话，谈话",
    "phonetic": "/ˌkɒnvəˈseɪʃən/",
    "syllables": ["con", "ver", "sa", "tion"]
  }
}
```

### 手动模式参数错误

```json
{
  "error": "手动添加模式下，translation 是必填项"
}
```

```json
{
  "error": "syllables 必须是非空数组"
}
```

### AI模式失败

```json
{
  "error": "AI自动获取单词信息失败",
  "message": "请检查 DEEPSEEK_API_KEY 配置或使用手动添加模式"
}
```

**解决方案**：切换到手动添加模式

---

## 选择建议

### 选择手动添加的情况

✅ 你正在批量导入已整理好的单词表  
✅ 网络不稳定或没有配置 API Key  
✅ 需要严格控制音节划分  
✅ 需要快速添加（不依赖 AI 响应时间）

### 选择AI自动获取的情况

✅ 遇到新单词，不确定如何划分音节  
✅ 需要标准的国际音标  
✅ 需要准确的中文翻译  
✅ 配置了 Deepseek API Key  
✅ 不着急，可以等待 AI 响应

---

## 完整示例：从注册到添加单词

```python
import requests

BASE_URL = "http://localhost:5000/api"

# 1. 注册用户
register_data = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
token = response.json()['access_token']
print(f"注册成功，获得令牌: {token[:20]}...")

# 2. 设置请求头
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 3. 手动添加单词
manual_word = {
    "word": "conversation",
    "syllables": ["con", "ver", "sa", "tion"],
    "translation": "会话，谈话",
    "phonetic": "/ˌkɒnvəˈseɪʃən/"
}
response = requests.post(f"{BASE_URL}/words", headers=headers, json=manual_word)
print(f"\n手动添加: {response.json()['message']}")

# 4. AI自动添加单词
auto_word = {"word": "important"}
response = requests.post(f"{BASE_URL}/words", headers=headers, json=auto_word)
result = response.json()
print(f"\nAI自动添加: {result['message']}")
print(f"音节: {' '.join(result['word']['syllables'])}")

# 5. 查询单词
response = requests.get(
    f"{BASE_URL}/words/search",
    headers=headers,
    params={"word": "conversation"}
)
word = response.json()['word']
print(f"\n查询单词: {word['word']}")
print(f"查询次数: {word['query_count']}")
```

---

## 注意事项

1. **API Key 配置**：AI自动模式需要在 `.env` 文件中配置 `DEEPSEEK_API_KEY`
2. **单词格式**：单词会自动转换为小写
3. **音节数组**：手动模式中，音节必须是数组格式，不能是字符串
4. **网络超时**：AI模式可能需要几秒钟响应时间
5. **频率限制**：批量添加时建议添加延时，避免触发 API 频率限制

