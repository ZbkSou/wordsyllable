# 单词记忆工具 - 数据库设计

> **SQL 创建脚本**：查看 `create_database.sql` 获取完整的数据库创建脚本

## 数据表结构

### 1. users 表 - 用户信息
- id: 主键（自增）
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password_hash: 密码哈希
- created_at: 创建时间
- updated_at: 更新时间

### 2. words 表 - 单词信息
- id: 主键（自增）
- word: 单词（唯一）
- translation: 翻译
- phonetic: 音标
- created_at: 创建时间
- updated_at: 更新时间

### 3. syllables 表 - 音节信息
- id: 主键（自增）
- syllable: 音节内容（唯一）
- created_at: 创建时间

### 4. word_syllables 表 - 单词和音节关联表
- id: 主键（自增）
- word_id: 外键关联 words.id
- syllable_id: 外键关联 syllables.id
- position: 音节在单词中的位置（顺序）
- created_at: 创建时间

### 5. user_word_queries 表 - 用户查询单词记录
- id: 主键（自增）
- user_id: 外键关联 users.id
- word_id: 外键关联 words.id
- query_count: 查询次数（默认0）
- last_queried_at: 最后查询时间
- created_at: 创建时间

### 6. user_syllable_queries 表 - 用户查询音节记录
- id: 主键（自增）
- user_id: 外键关联 users.id
- syllable_id: 外键关联 syllables.id
- query_count: 查询次数（默认0）
- last_queried_at: 最后查询时间
- created_at: 创建时间

## 索引设计
- users: username, email
- words: word
- syllables: syllable
- word_syllables: word_id, syllable_id
- user_word_queries: user_id + word_id (联合唯一索引)
- user_syllable_queries: user_id + syllable_id (联合唯一索引)

## 使用 SQL 脚本创建数据库

### SQLite（默认）
```bash
sqlite3 word_memory.db < create_database.sql
```

### MySQL
```bash
mysql -u username -p database_name < create_database.sql
# 注意：需要先修改脚本中的主键语法为 MySQL 格式
```

### PostgreSQL
```bash
psql -U username -d database_name -f create_database.sql
# 注意：需要先修改脚本中的主键语法为 PostgreSQL 格式
```

## 注意事项

1. **自动创建**：使用 Python 启动脚本时，数据库表会通过 SQLAlchemy 自动创建
2. **手动创建**：如果需要手动创建，可以使用 `create_database.sql` 脚本
3. **外键约束**：已设置 `ON DELETE CASCADE`，删除主记录时自动删除关联记录
4. **唯一索引**：确保数据完整性，防止重复记录
5. **时间戳**：所有表都包含创建时间，部分表包含更新时间

