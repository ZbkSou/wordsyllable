"""
单词记忆工具 Flask 应用
"""
import os
from datetime import datetime, timedelta
import requests
from flask import Flask, request, jsonify, Response
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import func

from models import db, User, Word, Syllable, WordSyllable, UserWordQuery, UserSyllableQuery
from deepseek_service import DeepseekService

# 加载环境变量
load_dotenv()

# 创建Flask应用
app = Flask(__name__)

# 配置
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///word_memory.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# 初始化 Deepseek 服务
deepseek_service = DeepseekService()


# ==================== 用户认证相关 API ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # 验证必填字段
        if not username or not email or not password:
            return jsonify({'error': '用户名、邮箱和密码都是必填项'}), 400
        
        # 检查用户名是否已存在
        if User.query.filter_by(username=username).first():
            return jsonify({'error': '用户名已存在'}), 400
        
        # 检查邮箱是否已存在
        if User.query.filter_by(email=email).first():
            return jsonify({'error': '邮箱已被注册'}), 400
        
        # 创建新用户
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # 生成访问令牌（identity 必须是字符串）
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': '注册成功',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'注册失败: {str(e)}'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': '用户名和密码都是必填项'}), 400
        
        # 查找用户
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': '用户名或密码错误'}), 401
        
        # 生成访问令牌（identity 必须是字符串）
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': '登录成功',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'登录失败: {str(e)}'}), 500


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""
    try:
        user_id = int(get_jwt_identity())  # 从字符串转回整数
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户信息失败: {str(e)}'}), 500


# ==================== 单词管理相关 API ====================

@app.route('/api/words', methods=['POST'])
@jwt_required()
def add_word():
    """
    添加单词（支持两种模式）
    
    模式1 - 手动添加：传入完整信息
    {
        "word": "conversation",
        "syllables": ["con", "ver", "sa", "tion"],
        "translation": "会话，谈话",
        "phonetic": "/ˌkɒnvəˈseɪʃən/"
    }
    
    模式2 - AI自动获取：只传入单词
    {
        "word": "conversation"
    }
    """
    try:
        data = request.get_json()
        
        word_text = data.get('word', '').strip().lower()
        if not word_text:
            return jsonify({'error': '单词是必填项'}), 400
        
        # 检查单词是否已存在
        existing_word = Word.query.filter_by(word=word_text).first()
        if existing_word:
            return jsonify({
                'message': '单词已存在',
                'word': existing_word.to_dict()
            }), 200
        
        # 判断是手动模式还是AI自动模式
        syllables_input = data.get('syllables')
        
        # 模式1：手动添加（传入了 syllables）
        if syllables_input is not None:
            translation = data.get('translation', '').strip()
            phonetic = data.get('phonetic', '').strip()
            phonetic_analysis = data.get('phonetic_analysis', '').strip()
            root_affix = data.get('root_affix', '').strip()
            
            # 验证必填字段
            if not translation:
                return jsonify({'error': '手动添加模式下，translation 是必填项'}), 400
            
            # 验证 syllables 格式
            if not isinstance(syllables_input, list) or not syllables_input:
                return jsonify({'error': 'syllables 必须是非空数组'}), 400
            
            syllables_list = [s.strip().lower() for s in syllables_input if s.strip()]
            
            if not syllables_list:
                return jsonify({'error': 'syllables 不能为空'}), 400
            
            # 创建单词
            word = Word(
                word=word_text,
                translation=translation,
                phonetic=phonetic,
                phonetic_analysis=phonetic_analysis,
                root_affix=root_affix
            )
            db.session.add(word)
            db.session.flush()
            
            print(f"手动添加单词: {word_text}")
            print(f"  音标: {phonetic}")
            print(f"  翻译: {translation}")
            print(f"  音节: {' '.join(syllables_list)}")
            print(f"  自然拼读: {phonetic_analysis}")
            print(f"  词根词缀: {root_affix}")
        
        # 模式2：AI自动获取
        else:
            print(f"AI自动获取单词信息: {word_text}")
            
            # 调用 Deepseek API 获取完整信息
            word_info = deepseek_service.get_word_info(word_text)
            
            if not word_info:
                return jsonify({
                    'error': 'AI自动获取单词信息失败',
                    'message': '请检查 DEEPSEEK_API_KEY 配置或使用手动添加模式'
                }), 500
            
            # 创建单词
            word = Word(
                word=word_text,
                translation=word_info['translation'],
                phonetic=word_info['phonetic'],
                phonetic_analysis=word_info.get('phonetic_analysis', ''),
                root_affix=word_info.get('root_affix', '')
            )
            db.session.add(word)
            db.session.flush()
            
            syllables_list = word_info['syllables']
        
        # 创建或获取音节，并关联到单词
        for position, syllable_text in enumerate(syllables_list):
            syllable_text = syllable_text.strip().lower()
            if not syllable_text:
                continue
            
            # 查找或创建音节
            syllable = Syllable.query.filter_by(syllable=syllable_text).first()
            if not syllable:
                syllable = Syllable(syllable=syllable_text)
                db.session.add(syllable)
                db.session.flush()
            
            # 创建单词-音节关联
            word_syllable = WordSyllable(
                word_id=word.id,
                syllable_id=syllable.id,
                position=position
            )
            db.session.add(word_syllable)
        
        db.session.commit()
        
        mode = "手动添加" if syllables_input is not None else "AI自动获取"
        
        return jsonify({
            'message': f'单词添加成功（{mode}）',
            'word': word.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'添加单词失败: {str(e)}'}), 500


@app.route('/api/words/<int:word_id>', methods=['GET'])
@jwt_required()
def get_word(word_id):
    """查询单词详情（会记录查询次数）"""
    try:
        user_id = int(get_jwt_identity())  # 从字符串转回整数
        
        # 查找单词
        word = Word.query.get(word_id)
        if not word:
            return jsonify({'error': '单词不存在'}), 404
        
        # 记录用户查询单词次数
        user_word_query = UserWordQuery.query.filter_by(
            user_id=user_id,
            word_id=word_id
        ).first()
        
        if user_word_query:
            user_word_query.query_count += 1
            user_word_query.last_queried_at = datetime.utcnow()
        else:
            user_word_query = UserWordQuery(
                user_id=user_id,
                word_id=word_id,
                query_count=1
            )
            db.session.add(user_word_query)
        
        # 记录用户查询音节次数
        for word_syllable in word.word_syllables.all():
            syllable_id = word_syllable.syllable_id
            
            user_syllable_query = UserSyllableQuery.query.filter_by(
                user_id=user_id,
                syllable_id=syllable_id
            ).first()
            
            if user_syllable_query:
                user_syllable_query.query_count += 1
                user_syllable_query.last_queried_at = datetime.utcnow()
            else:
                user_syllable_query = UserSyllableQuery(
                    user_id=user_id,
                    syllable_id=syllable_id,
                    query_count=1
                )
                db.session.add(user_syllable_query)
        
        db.session.commit()
        
        # 返回单词信息和查询次数
        word_dict = word.to_dict()
        word_dict['query_count'] = user_word_query.query_count
        
        return jsonify({'word': word_dict}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'查询单词失败: {str(e)}'}), 500


@app.route('/api/words/search', methods=['GET'])
@jwt_required()
def search_word():
    """按单词文本搜索（会记录查询次数）"""
    try:
        user_id = int(get_jwt_identity())  # 从字符串转回整数
        word_text = request.args.get('word', '').strip().lower()
        
        if not word_text:
            return jsonify({'error': '请提供要搜索的单词'}), 400
        
        # 查找单词
        word = Word.query.filter_by(word=word_text).first()
        if not word:
            return jsonify({'error': '单词不存在'}), 404
        
        # 记录用户查询单词次数
        user_word_query = UserWordQuery.query.filter_by(
            user_id=user_id,
            word_id=word.id
        ).first()
        
        if user_word_query:
            user_word_query.query_count += 1
            user_word_query.last_queried_at = datetime.utcnow()
        else:
            user_word_query = UserWordQuery(
                user_id=user_id,
                word_id=word.id,
                query_count=1
            )
            db.session.add(user_word_query)
        
        # 记录用户查询音节次数
        for word_syllable in word.word_syllables.all():
            syllable_id = word_syllable.syllable_id
            
            user_syllable_query = UserSyllableQuery.query.filter_by(
                user_id=user_id,
                syllable_id=syllable_id
            ).first()
            
            if user_syllable_query:
                user_syllable_query.query_count += 1
                user_syllable_query.last_queried_at = datetime.utcnow()
            else:
                user_syllable_query = UserSyllableQuery(
                    user_id=user_id,
                    syllable_id=syllable_id,
                    query_count=1
                )
                db.session.add(user_syllable_query)
        
        db.session.commit()
        
        # 返回单词信息和查询次数
        word_dict = word.to_dict()
        word_dict['query_count'] = user_word_query.query_count
        
        return jsonify({'word': word_dict}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'搜索单词失败: {str(e)}'}), 500


@app.route('/api/words/public-lookup', methods=['POST'])
def public_lookup_word():
    """
    公开单词查询接口（无需登录）
    
    参数：
        word: 单词（必需）
        code: 验证码（可选）
            - 为空或不传：只查询，不记录次数
            - "19921012QWER"：查询并记录次数到 userId=4 用户，不存在则自动添加（AI模式）
    
    返回：
        word: 单词信息
        action: 操作类型（queried/added/not_found）
    """
    try:
        data = request.get_json()
        
        word_text = data.get('word', '').strip().lower()
        code = data.get('code', '').strip()
        
        if not word_text:
            return jsonify({'error': '请提供单词'}), 400
        
        # 验证 code 并决定是否记录次数
        should_record = code == '19921012QWER'
        target_user_id = 4  # 固定用户ID
        
        # 查找单词是否已存在
        word = Word.query.filter_by(word=word_text).first()
        
        # 情况1：单词已存在
        if word:
            print(f"[公开查询] 单词 '{word_text}' 已存在")
            
            # 如果需要记录次数
            if should_record:
                print(f"  -> 记录查询次数到用户 {target_user_id}")
                
                # 记录用户查询单词次数
                user_word_query = UserWordQuery.query.filter_by(
                    user_id=target_user_id,
                    word_id=word.id
                ).first()
                
                if user_word_query:
                    user_word_query.query_count += 1
                    user_word_query.last_queried_at = datetime.utcnow()
                else:
                    user_word_query = UserWordQuery(
                        user_id=target_user_id,
                        word_id=word.id,
                        query_count=1
                    )
                    db.session.add(user_word_query)
                
                # 记录用户查询音节次数
                for word_syllable in word.word_syllables.all():
                    syllable_id = word_syllable.syllable_id
                    
                    user_syllable_query = UserSyllableQuery.query.filter_by(
                        user_id=target_user_id,
                        syllable_id=syllable_id
                    ).first()
                    
                    if user_syllable_query:
                        user_syllable_query.query_count += 1
                        user_syllable_query.last_queried_at = datetime.utcnow()
                    else:
                        user_syllable_query = UserSyllableQuery(
                            user_id=target_user_id,
                            syllable_id=syllable_id,
                            query_count=1
                        )
                        db.session.add(user_syllable_query)
                
                db.session.commit()
                
                word_dict = word.to_dict()
                word_dict['query_count'] = user_word_query.query_count
            else:
                word_dict = word.to_dict()
            
            return jsonify({
                'message': '单词已存在',
                'action': 'queried',
                'word': word_dict
            }), 200
        
        # 情况2：单词不存在
        else:
            # 如果有正确的 code，使用 AI 自动添加
            if should_record:
                print(f"[公开查询] 单词 '{word_text}' 不存在，使用AI自动添加")
                
                # 调用 Deepseek API 获取完整信息
                word_info = deepseek_service.get_word_info(word_text)
                
                if not word_info:
                    return jsonify({
                        'error': 'AI自动获取单词信息失败',
                        'action': 'error'
                    }), 500
                
                # 创建单词
                word = Word(
                    word=word_text,
                    translation=word_info['translation'],
                    phonetic=word_info['phonetic'],
                    phonetic_analysis=word_info.get('phonetic_analysis', ''),
                    root_affix=word_info.get('root_affix', '')
                )
                db.session.add(word)
                db.session.flush()
                
                syllables_list = word_info['syllables']
                
                # 创建或获取音节，并关联到单词
                for position, syllable_text in enumerate(syllables_list):
                    syllable_text = syllable_text.strip().lower()
                    if not syllable_text:
                        continue
                    
                    syllable = Syllable.query.filter_by(syllable=syllable_text).first()
                    if not syllable:
                        syllable = Syllable(syllable=syllable_text)
                        db.session.add(syllable)
                        db.session.flush()
                    
                    word_syllable_obj = WordSyllable(
                        word_id=word.id,
                        syllable_id=syllable.id,
                        position=position
                    )
                    db.session.add(word_syllable_obj)
                
                # 记录查询次数
                user_word_query = UserWordQuery(
                    user_id=target_user_id,
                    word_id=word.id,
                    query_count=1
                )
                db.session.add(user_word_query)
                
                db.session.commit()
                
                print(f"  -> 单词添加成功并记录到用户 {target_user_id}")
                
                word_dict = word.to_dict()
                word_dict['query_count'] = 1
                
                return jsonify({
                    'message': '单词不存在，已自动添加（AI模式）',
                    'action': 'added',
                    'word': word_dict
                }), 201
            
            # 没有正确的 code，只返回未找到
            else:
                return jsonify({
                    'message': '单词不存在',
                    'action': 'not_found',
                    'word': None
                }), 404
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'查询失败: {str(e)}'}), 500


@app.route('/api/words/lookup', methods=['POST'])
@jwt_required()
def lookup_word():
    """智能查询单词：存在则查询并记录次数，不存在则自动添加（AI模式）"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        word_text = data.get('word', '').strip().lower()
        
        if not word_text:
            return jsonify({'error': '请提供单词'}), 400
        
        # 查找单词是否已存在
        word = Word.query.filter_by(word=word_text).first()
        
        # 情况1：单词已存在 - 查询并记录次数
        if word:
            print(f"单词 '{word_text}' 已存在，返回详情并记录查询次数")
            
            # 记录用户查询单词次数
            user_word_query = UserWordQuery.query.filter_by(
                user_id=user_id,
                word_id=word.id
            ).first()
            
            if user_word_query:
                user_word_query.query_count += 1
                user_word_query.last_queried_at = datetime.utcnow()
            else:
                user_word_query = UserWordQuery(
                    user_id=user_id,
                    word_id=word.id,
                    query_count=1
                )
                db.session.add(user_word_query)
            
            # 记录用户查询音节次数
            for word_syllable in word.word_syllables.all():
                syllable_id = word_syllable.syllable_id
                
                user_syllable_query = UserSyllableQuery.query.filter_by(
                    user_id=user_id,
                    syllable_id=syllable_id
                ).first()
                
                if user_syllable_query:
                    user_syllable_query.query_count += 1
                    user_syllable_query.last_queried_at = datetime.utcnow()
                else:
                    user_syllable_query = UserSyllableQuery(
                        user_id=user_id,
                        syllable_id=syllable_id,
                        query_count=1
                    )
                    db.session.add(user_syllable_query)
            
            db.session.commit()
            
            # 返回单词信息
            word_dict = word.to_dict()
            word_dict['query_count'] = user_word_query.query_count
            
            return jsonify({
                'message': '单词已存在',
                'action': 'queried',
                'word': word_dict
            }), 200
        
        # 情况2：单词不存在 - 使用AI自动添加
        else:
            print(f"单词 '{word_text}' 不存在，使用AI自动添加")
            
            # 调用 Deepseek API 获取完整信息
            word_info = deepseek_service.get_word_info(word_text)
            
            if not word_info:
                return jsonify({
                    'error': 'AI自动获取单词信息失败',
                    'message': '请检查 DEEPSEEK_API_KEY 配置或使用手动添加模式'
                }), 500
            
            # 创建单词
            word = Word(
                word=word_text,
                translation=word_info['translation'],
                phonetic=word_info['phonetic'],
                phonetic_analysis=word_info.get('phonetic_analysis', ''),
                root_affix=word_info.get('root_affix', '')
            )
            db.session.add(word)
            db.session.flush()
            
            syllables_list = word_info['syllables']
            
            # 创建或获取音节，并关联到单词
            for position, syllable_text in enumerate(syllables_list):
                syllable_text = syllable_text.strip().lower()
                if not syllable_text:
                    continue
                
                # 查找或创建音节
                syllable = Syllable.query.filter_by(syllable=syllable_text).first()
                if not syllable:
                    syllable = Syllable(syllable=syllable_text)
                    db.session.add(syllable)
                    db.session.flush()
                
                # 创建单词-音节关联
                word_syllable = WordSyllable(
                    word_id=word.id,
                    syllable_id=syllable.id,
                    position=position
                )
                db.session.add(word_syllable)
            
            db.session.commit()
            
            print(f"单词添加成功: {word.word}")
            print(f"  音标: {word.phonetic}")
            print(f"  翻译: {word.translation}")
            print(f"  音节: {' '.join(syllables_list)}")
            print(f"  自然拼读: {word.phonetic_analysis}")
            print(f"  词根词缀: {word.root_affix}")
            
            return jsonify({
                'message': '单词不存在，已自动添加（AI自动获取）',
                'action': 'added',
                'word': word.to_dict()
            }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'智能查询失败: {str(e)}'}), 500


@app.route('/api/words', methods=['GET'])
@jwt_required()
def list_words():
    """获取单词列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 分页查询
        pagination = Word.query.order_by(Word.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        words = [word.to_dict() for word in pagination.items]
        
        return jsonify({
            'words': words,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取单词列表失败: {str(e)}'}), 500


@app.route('/api/syllables/words', methods=['GET'])
@jwt_required()
def get_words_by_syllable():
    """
    根据音节查询包含该音节的所有单词
    不记录查询次数，支持分页
    
    参数：
        syllable: 音节（必需）
        page: 页码（可选，默认1）
        per_page: 每页数量（可选，默认50，最小50）
    
    返回：
        words: 单词列表（包含完整信息）
        syllable: 查询的音节
        total: 总单词数
        page: 当前页
        per_page: 每页数量
        pages: 总页数
    """
    try:
        syllable_text = request.args.get('syllable', '').strip().lower()
        
        if not syllable_text:
            return jsonify({'error': '请提供要查询的音节'}), 400
        
        # 查找音节
        syllable = Syllable.query.filter_by(syllable=syllable_text).first()
        if not syllable:
            return jsonify({
                'syllable': syllable_text,
                'words': [],
                'total': 0,
                'page': 1,
                'per_page': 50,
                'pages': 0,
                'message': '未找到包含该音节的单词'
            }), 200
        
        # 分页参数，确保最小为50
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # 确保每页至少50条
        if per_page < 50:
            per_page = 50
        
        # 通过 WordSyllable 关联查询包含该音节的所有单词
        # 使用 join 查询提高效率
        word_ids_subquery = db.session.query(WordSyllable.word_id)\
            .filter(WordSyllable.syllable_id == syllable.id)\
            .distinct()\
            .subquery()
        
        # 分页查询单词
        pagination = Word.query\
            .filter(Word.id.in_(word_ids_subquery))\
            .order_by(Word.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        # 获取单词的完整信息
        words = [word.to_dict() for word in pagination.items]
        
        return jsonify({
            'syllable': syllable_text,
            'words': words,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'查询失败: {str(e)}'}), 500


# ==================== 统计相关 API ====================

@app.route('/api/stats/words', methods=['GET'])
@jwt_required()
def get_word_stats():
    """获取用户的单词查询统计"""
    try:
        user_id = int(get_jwt_identity())  # 从字符串转回整数
        limit = request.args.get('limit', 50, type=int)
        
        # 查询用户查询次数最多的单词
        queries = UserWordQuery.query.filter_by(user_id=user_id)\
            .order_by(UserWordQuery.query_count.desc())\
            .limit(limit)\
            .all()
        
        stats = [q.to_dict() for q in queries]
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取统计失败: {str(e)}'}), 500


@app.route('/api/stats/syllables', methods=['GET'])
@jwt_required()
def get_syllable_stats():
    """获取用户的音节查询统计"""
    try:
        user_id = int(get_jwt_identity())  # 从字符串转回整数
        limit = request.args.get('limit', 50, type=int)
        
        # 查询用户查询次数最多的音节
        queries = UserSyllableQuery.query.filter_by(user_id=user_id)\
            .order_by(UserSyllableQuery.query_count.desc())\
            .limit(limit)\
            .all()
        
        stats = [q.to_dict() for q in queries]
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取统计失败: {str(e)}'}), 500


@app.route('/api/stats/overview', methods=['GET'])
@jwt_required()
def get_stats_overview():
    """获取用户的统计概览"""
    try:
        user_id = int(get_jwt_identity())  # 从字符串转回整数
        
        # 总查询单词数
        total_word_queries = db.session.query(func.sum(UserWordQuery.query_count))\
            .filter_by(user_id=user_id).scalar() or 0
        
        # 查询过的不同单词数
        unique_words_queried = UserWordQuery.query.filter_by(user_id=user_id).count()
        
        # 总查询音节数
        total_syllable_queries = db.session.query(func.sum(UserSyllableQuery.query_count))\
            .filter_by(user_id=user_id).scalar() or 0
        
        # 查询过的不同音节数
        unique_syllables_queried = UserSyllableQuery.query.filter_by(user_id=user_id).count()
        
        # 系统中总单词数
        total_words_in_system = Word.query.count()
        
        # 系统中总音节数
        total_syllables_in_system = Syllable.query.count()
        
        return jsonify({
            'overview': {
                'total_word_queries': total_word_queries,
                'unique_words_queried': unique_words_queried,
                'total_syllable_queries': total_syllable_queries,
                'unique_syllables_queried': unique_syllables_queried,
                'total_words_in_system': total_words_in_system,
                'total_syllables_in_system': total_syllables_in_system
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取统计概览失败: {str(e)}'}), 500


# ==================== NCE 资源代理 ====================

NCE_BASE_URL = 'https://nce.ichochy.com'

# https://nce.ichochy.com/NCE2/01%EF%BC%8DA%20Private%20Conversation.mp3
@app.route('/api/nce/proxy', methods=['GET'])
def nce_proxy():
    """
    NCE 资源代理接口
    转发 LRC 和 MP3 文件请求，解决 CORS 问题
    
    参数：
        book: 课本编号（1-4）
        filename: 文件名
        type: 文件类型（lrc 或 mp3）
    
    示例：
        /api/nce/proxy?book=2&filename=01－A%20Private%20Conversation&type=lrc
    """
    try:
        book = request.args.get('book', '').strip()
        filename = request.args.get('filename', '').strip()
        file_type = request.args.get('type', '').strip().lower()
        
        # 参数验证
        if not book or not filename or not file_type:
            return jsonify({'error': '缺少必要参数: book, filename, type'}), 400
        
        if file_type not in ['lrc', 'mp3']:
            return jsonify({'error': 'type 必须是 lrc 或 mp3'}), 400
        
        if book not in ['1', '2', '3', '4']:
            return jsonify({'error': 'book 必须是 1-4'}), 400
        
        # 构建外部 URL
        external_url = f"{NCE_BASE_URL}/NCE{book}/{filename}.{file_type}"
        print(f"[NCE代理] 请求: {external_url}")
        
        # 请求外部资源
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(external_url, headers=headers, timeout=30, stream=True)
        
        if response.status_code != 200:
            print(f"[NCE代理] 外部请求失败: {response.status_code}")
            return jsonify({'error': f'资源加载失败: {response.status_code}'}), response.status_code
        
        # 设置响应 Content-Type
        if file_type == 'lrc':
            content_type = 'text/plain; charset=utf-8'
        else:
            content_type = 'audio/mpeg'
        
        # 返回代理响应
        return Response(
            response.content,
            status=200,
            headers={
                'Content-Type': content_type,
                'Cache-Control': 'public, max-age=86400',  # 缓存24小时
                'Access-Control-Allow-Origin': '*'
            }
        )
        
    except requests.Timeout:
        print("[NCE代理] 请求超时")
        return jsonify({'error': '请求超时'}), 504
    except requests.RequestException as e:
        print(f"[NCE代理] 请求异常: {e}")
        return jsonify({'error': f'请求失败: {str(e)}'}), 500
    except Exception as e:
        print(f"[NCE代理] 错误: {e}")
        return jsonify({'error': f'代理失败: {str(e)}'}), 500


# ==================== 健康检查 ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'message': '单词记忆工具 API 运行正常'
    }), 200


# ==================== 初始化数据库 ====================

def init_db():
    """初始化数据库"""
    with app.app_context():
        db.create_all()
        print("数据库初始化完成！")


if __name__ == '__main__':
    # 初始化数据库
    init_db()
    
    # 启动应用
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"正在启动服务器...")
    print(f"地址: http://{host}:{port}")
    print(f"调试模式: {debug}")
    
    app.run(host=host, port=port, debug=debug)

