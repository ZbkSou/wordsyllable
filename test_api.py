#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
单词记忆工具 API 测试示例
"""
import requests
import json

# 服务器地址
BASE_URL = "http://localhost:5000/api"

# 全局变量存储 token
access_token = None


def print_response(response, title=""):
    """打印响应结果"""
    print("\n" + "=" * 60)
    if title:
        print(f"{title}")
        print("-" * 60)
    print(f"状态码: {response.status_code}")
    try:
        data = response.json()
        print(f"响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
    except:
        print(f"响应: {response.text}")
    print("=" * 60)


def test_health():
    """测试健康检查"""
    print("\n>>> 测试 1: 健康检查")
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "健康检查")


def test_register():
    """测试用户注册"""
    global access_token
    
    print("\n>>> 测试 2: 用户注册")
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=data
    )
    print_response(response, "用户注册")
    
    if response.status_code == 201:
        result = response.json()
        access_token = result.get('access_token')
        print(f"\n✓ 注册成功！令牌: {access_token[:50]}...")


def test_login():
    """测试用户登录"""
    global access_token
    
    print("\n>>> 测试 3: 用户登录")
    data = {
        "username": "testuser",
        "password": "password123"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=data
    )
    print_response(response, "用户登录")
    
    if response.status_code == 200:
        result = response.json()
        access_token = result.get('access_token')
        print(f"\n✓ 登录成功！令牌: {access_token[:50]}...")


def test_get_current_user():
    """测试获取当前用户信息"""
    print("\n>>> 测试 4: 获取当前用户信息")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers=headers
    )
    print_response(response, "获取当前用户")


def test_add_word_manual(word, syllables, translation, phonetic=""):
    """测试手动添加单词"""
    print(f"\n>>> 测试 5a: 手动添加单词 '{word}'")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "word": word,
        "syllables": syllables,
        "translation": translation,
        "phonetic": phonetic
    }
    
    response = requests.post(
        f"{BASE_URL}/words",
        headers=headers,
        json=data
    )
    print_response(response, f"手动添加单词: {word}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        word_data = result.get('word', {})
        syllables_result = word_data.get('syllables', [])
        print(f"\n✓ 单词添加成功（手动模式）！音节分词: {' '.join(syllables_result)}")


def test_add_word_auto(word):
    """测试AI自动添加单词"""
    print(f"\n>>> 测试 5b: AI自动添加单词 '{word}'")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "word": word
    }
    
    response = requests.post(
        f"{BASE_URL}/words",
        headers=headers,
        json=data
    )
    print_response(response, f"AI自动添加单词: {word}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        word_data = result.get('word', {})
        syllables_result = word_data.get('syllables', [])
        translation = word_data.get('translation', '')
        phonetic = word_data.get('phonetic', '')
        print(f"\n✓ 单词添加成功（AI自动模式）！")
        print(f"  音标: {phonetic}")
        print(f"  翻译: {translation}")
        print(f"  音节: {' '.join(syllables_result)}")


def test_search_word(word):
    """测试搜索单词"""
    print(f"\n>>> 测试 7: 搜索单词 '{word}'")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/words/search",
        headers=headers,
        params={"word": word}
    )
    print_response(response, f"搜索单词: {word}")


def test_list_words():
    """测试获取单词列表"""
    print("\n>>> 测试 8: 获取单词列表")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/words",
        headers=headers,
        params={"page": 1, "per_page": 10}
    )
    print_response(response, "获取单词列表")


def test_word_stats():
    """测试单词查询统计"""
    print("\n>>> 测试 9: 单词查询统计")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/stats/words",
        headers=headers,
        params={"limit": 10}
    )
    print_response(response, "单词查询统计")


def test_syllable_stats():
    """测试音节查询统计"""
    print("\n>>> 测试 10: 音节查询统计")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/stats/syllables",
        headers=headers,
        params={"limit": 10}
    )
    print_response(response, "音节查询统计")


def test_stats_overview():
    """测试统计概览"""
    print("\n>>> 测试 11: 统计概览")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/stats/overview",
        headers=headers
    )
    print_response(response, "统计概览")


def main():
    """主测试流程"""
    print("=" * 60)
    print("单词记忆工具 API 测试")
    print("=" * 60)
    print(f"服务器地址: {BASE_URL}")
    print("=" * 60)
    
    try:
        # 1. 健康检查
        test_health()
        
        # 2. 用户注册（如果已注册会返回用户信息）
        test_register()
        
        # 如果注册失败（可能已存在），尝试登录
        if not access_token:
            test_login()
        
        # 确保有 token
        if not access_token:
            print("\n✗ 无法获取访问令牌，测试终止")
            return
        
        # 3. 获取当前用户信息
        test_get_current_user()
        
        # 4. 添加单词 - 手动模式
        print("\n" + "=" * 60)
        print("测试手动添加模式")
        print("=" * 60)
        test_add_word_manual(
            "conversation", 
            ["con", "ver", "sa", "tion"],
            "会话，谈话", 
            "/ˌkɒnvəˈseɪʃn/"
        )
        test_add_word_manual(
            "important",
            ["im", "por", "tant"],
            "重要的",
            "/ɪmˈpɔːtnt/"
        )
        
        # 5. 添加单词 - AI自动模式
        print("\n" + "=" * 60)
        print("测试AI自动添加模式")
        print("=" * 60)
        test_add_word_auto("beautiful")
        test_add_word_auto("education")
        
        # 6. 搜索单词
        print("\n" + "=" * 60)
        print("测试搜索单词")
        print("=" * 60)
        test_search_word("conversation")
        test_search_word("important")
        
        # 7. 获取单词列表
        test_list_words()
        
        # 8. 查询统计
        test_word_stats()
        test_syllable_stats()
        test_stats_overview()
        
        print("\n" + "=" * 60)
        print("✓ 所有测试完成！")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n✗ 无法连接到服务器，请确保服务器正在运行")
        print("  运行命令: python start_server.py")
    except Exception as e:
        print(f"\n✗ 测试过程中出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

