-- ============================================================
-- 单词记忆工具 - 数据库创建脚本
-- 支持: SQLite, MySQL, PostgreSQL
-- ============================================================

-- 1. 用户表 - users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- SQLite
    -- id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    -- id SERIAL PRIMARY KEY,              -- PostgreSQL
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================

-- 2. 单词表 - words
CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- SQLite
    -- id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    -- id SERIAL PRIMARY KEY,              -- PostgreSQL
    word VARCHAR(100) NOT NULL UNIQUE,
    translation TEXT NOT NULL,
    phonetic VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 单词表索引
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);

-- ============================================================

-- 3. 音节表 - syllables
CREATE TABLE IF NOT EXISTS syllables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- SQLite
    -- id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    -- id SERIAL PRIMARY KEY,              -- PostgreSQL
    syllable VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 音节表索引
CREATE INDEX IF NOT EXISTS idx_syllables_syllable ON syllables(syllable);

-- ============================================================

-- 4. 单词-音节关联表 - word_syllables
CREATE TABLE IF NOT EXISTS word_syllables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- SQLite
    -- id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    -- id SERIAL PRIMARY KEY,              -- PostgreSQL
    word_id INTEGER NOT NULL,
    syllable_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (syllable_id) REFERENCES syllables(id) ON DELETE CASCADE,
    UNIQUE(word_id, syllable_id, position)
);

-- 单词-音节关联表索引
CREATE INDEX IF NOT EXISTS idx_word_syllables_word_id ON word_syllables(word_id);
CREATE INDEX IF NOT EXISTS idx_word_syllables_syllable_id ON word_syllables(syllable_id);

-- ============================================================

-- 5. 用户查询单词记录表 - user_word_queries
CREATE TABLE IF NOT EXISTS user_word_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- SQLite
    -- id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    -- id SERIAL PRIMARY KEY,              -- PostgreSQL
    user_id INTEGER NOT NULL,
    word_id INTEGER NOT NULL,
    query_count INTEGER DEFAULT 0,
    last_queried_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    UNIQUE(user_id, word_id)
);

-- 用户查询单词记录表索引
CREATE INDEX IF NOT EXISTS idx_user_word_queries_user_id ON user_word_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_queries_word_id ON user_word_queries(word_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_word_queries_unique ON user_word_queries(user_id, word_id);

-- ============================================================

-- 6. 用户查询音节记录表 - user_syllable_queries
CREATE TABLE IF NOT EXISTS user_syllable_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- SQLite
    -- id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    -- id SERIAL PRIMARY KEY,              -- PostgreSQL
    user_id INTEGER NOT NULL,
    syllable_id INTEGER NOT NULL,
    query_count INTEGER DEFAULT 0,
    last_queried_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (syllable_id) REFERENCES syllables(id) ON DELETE CASCADE,
    UNIQUE(user_id, syllable_id)
);

-- 用户查询音节记录表索引
CREATE INDEX IF NOT EXISTS idx_user_syllable_queries_user_id ON user_syllable_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_syllable_queries_syllable_id ON user_syllable_queries(syllable_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_syllable_queries_unique ON user_syllable_queries(user_id, syllable_id);

-- ============================================================
-- 使用说明
-- ============================================================
-- 
-- SQLite (默认):
--   sqlite3 word_memory.db < create_database.sql
--
-- MySQL:
--   mysql -u username -p database_name < create_database.sql
--   注意: 需要将上面的注释改为MySQL语法（取消MySQL行的注释，注释SQLite行）
--
-- PostgreSQL:
--   psql -U username -d database_name -f create_database.sql
--   注意: 需要将上面的注释改为PostgreSQL语法（取消PostgreSQL行的注释，注释SQLite行）
--
-- 注意事项:
-- 1. 默认使用 SQLite 语法（INTEGER PRIMARY KEY AUTOINCREMENT）
-- 2. 如果使用 MySQL，需要修改为：INT AUTO_INCREMENT PRIMARY KEY
-- 3. 如果使用 PostgreSQL，需要修改为：SERIAL PRIMARY KEY
-- 4. 外键约束已设置为 ON DELETE CASCADE（删除主记录时自动删除关联记录）
-- 5. 唯一索引确保数据完整性
--
-- ============================================================

