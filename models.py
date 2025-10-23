"""
数据库模型定义
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """用户表"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    word_queries = db.relationship('UserWordQuery', backref='user', lazy='dynamic')
    syllable_queries = db.relationship('UserSyllableQuery', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        """设置密码"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Word(db.Model):
    """单词表"""
    __tablename__ = 'words'
    
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100), unique=True, nullable=False, index=True)
    translation = db.Column(db.Text, nullable=False)
    phonetic = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    word_syllables = db.relationship('WordSyllable', backref='word', lazy='dynamic', 
                                     cascade='all, delete-orphan')
    user_queries = db.relationship('UserWordQuery', backref='word', lazy='dynamic')
    
    def to_dict(self, include_syllables=True):
        """转换为字典"""
        result = {
            'id': self.id,
            'word': self.word,
            'translation': self.translation,
            'phonetic': self.phonetic,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_syllables:
            # 按位置排序获取音节
            syllables = [ws.syllable.syllable for ws in 
                        sorted(self.word_syllables.all(), key=lambda x: x.position)]
            result['syllables'] = syllables
        
        return result


class Syllable(db.Model):
    """音节表"""
    __tablename__ = 'syllables'
    
    id = db.Column(db.Integer, primary_key=True)
    syllable = db.Column(db.String(50), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    word_syllables = db.relationship('WordSyllable', backref='syllable', lazy='dynamic')
    user_queries = db.relationship('UserSyllableQuery', backref='syllable', lazy='dynamic')
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'syllable': self.syllable,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class WordSyllable(db.Model):
    """单词和音节关联表"""
    __tablename__ = 'word_syllables'
    
    id = db.Column(db.Integer, primary_key=True)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'), nullable=False, index=True)
    syllable_id = db.Column(db.Integer, db.ForeignKey('syllables.id'), nullable=False, index=True)
    position = db.Column(db.Integer, nullable=False)  # 音节位置
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('word_id', 'syllable_id', 'position', name='uix_word_syllable_position'),
    )


class UserWordQuery(db.Model):
    """用户查询单词记录表"""
    __tablename__ = 'user_word_queries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'), nullable=False, index=True)
    query_count = db.Column(db.Integer, default=0)
    last_queried_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'word_id', name='uix_user_word'),
    )
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'word_id': self.word_id,
            'word': self.word.word if self.word else None,
            'query_count': self.query_count,
            'last_queried_at': self.last_queried_at.isoformat() if self.last_queried_at else None
        }


class UserSyllableQuery(db.Model):
    """用户查询音节记录表"""
    __tablename__ = 'user_syllable_queries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    syllable_id = db.Column(db.Integer, db.ForeignKey('syllables.id'), nullable=False, index=True)
    query_count = db.Column(db.Integer, default=0)
    last_queried_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'syllable_id', name='uix_user_syllable'),
    )
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'syllable_id': self.syllable_id,
            'syllable': self.syllable.syllable if self.syllable else None,
            'query_count': self.query_count,
            'last_queried_at': self.last_queried_at.isoformat() if self.last_queried_at else None
        }

