"""
Deepseek API 服务 - 用于单词音节分词和信息获取
"""
import os
import requests
import json
import re


class DeepseekService:
    """Deepseek API 服务类"""
    
    def __init__(self):
        self.api_key = os.getenv('DEEPSEEK_API_KEY')
        self.api_url = os.getenv('DEEPSEEK_API_URL', 'https://api.deepseek.com/v1/chat/completions')
    
    def syllabify_word(self, word):
        """
        使用 Deepseek API 对单词进行音节分词
        
        Args:
            word: 要分词的单词
            
        Returns:
            list: 音节列表，例如 ['con', 'ver', 'sa', 'tion']
            如果失败返回 None
        """
        if not self.api_key:
            print("警告: DEEPSEEK_API_KEY 未设置，使用默认分词")
            return self._default_syllabify(word)
        
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
            
            prompt = f"""请将英文单词 "{word}" 按照音标音节进行分词。
要求：
1. 只返回分词结果，用空格分隔，不要任何解释
2. 每个音节要准确
3. 例如：conversation 应该返回 "con ver sa tion"

单词: {word}
分词结果:"""
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 100
            }
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
                
                # 解析返回的音节
                syllables = [s.strip() for s in content.split() if s.strip()]
                
                if syllables:
                    print(f"Deepseek API 分词结果: {word} -> {syllables}")
                    return syllables
                else:
                    print(f"Deepseek API 返回空结果，使用默认分词")
                    return self._default_syllabify(word)
            else:
                print(f"Deepseek API 错误: {response.status_code} - {response.text}")
                return self._default_syllabify(word)
                
        except Exception as e:
            print(f"调用 Deepseek API 时出错: {str(e)}")
            return self._default_syllabify(word)
    
    def _default_syllabify(self, word):
        """
        默认分词方法（简单实现）
        如果 API 调用失败，使用这个方法
        
        Args:
            word: 要分词的单词
            
        Returns:
            list: 音节列表
        """
        # 简单的元音检测方法
        vowels = set('aeiouyAEIOUY')
        syllables = []
        current_syllable = ''
        
        for i, char in enumerate(word):
            current_syllable += char
            
            # 如果当前字符是元音，且下一个字符是辅音或结尾，则分词
            if char.lower() in vowels:
                if i + 1 >= len(word) or word[i + 1].lower() not in vowels:
                    if i + 2 < len(word):
                        syllables.append(current_syllable)
                        current_syllable = ''
        
        # 添加剩余部分
        if current_syllable:
            if syllables:
                syllables.append(current_syllable)
            else:
                syllables = [word]  # 如果没有分词，返回整个单词
        
        # 如果分词失败，至少返回整个单词
        if not syllables:
            syllables = [word]
        
        print(f"默认分词结果: {word} -> {syllables}")
        return syllables
    
    def get_word_info(self, word):
        """
        使用 Deepseek API 获取单词的完整信息
        包括：音标、翻译、音节分词
        
        Args:
            word: 要查询的单词
            
        Returns:
            dict: {
                'word': str,
                'phonetic': str,
                'translation': str,
                'syllables': list
            }
            如果失败返回 None
        """
        if not self.api_key:
            print("警告: DEEPSEEK_API_KEY 未设置，无法自动获取单词信息")
            return None
        
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
            
            prompt = f"""Provide details for the word "{word}". Return strictly in this JSON format:
{{
  "phonetic": "/IPA/", 
  "translation": "Chinese translation",
  "syllables": "syllable separation"
}}

Example:
Input: conversation
Output: {{"phonetic": "/ˌkɒnvəˈseɪʃn/", "translation": "会话", "syllables": "con ver sa tion"}}
Input: {word}
Output:"""
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 200
            }
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
                
                # 尝试解析JSON
                try:
                    # 提取JSON部分
                    json_match = re.search(r'\{[^}]+\}', content)
                    if json_match:
                        word_data = json.loads(json_match.group())
                        
                        # 解析音节
                        syllables_str = word_data.get('syllables', '')
                        syllables = [s.strip() for s in syllables_str.split() if s.strip()]
                        
                        # 如果音节为空，使用分词方法
                        if not syllables:
                            syllables = self.syllabify_word(word)
                        
                        result = {
                            'word': word.lower(),
                            'phonetic': word_data.get('phonetic', ''),
                            'translation': word_data.get('translation', ''),
                            'syllables': syllables
                        }
                        
                        print(f"Deepseek API 获取单词信息成功: {word}")
                        print(f"  音标: {result['phonetic']}")
                        print(f"  翻译: {result['translation']}")
                        print(f"  音节: {' '.join(result['syllables'])}")
                        
                        return result
                    else:
                        print(f"Deepseek API 返回格式错误，无法解析JSON")
                        return None
                        
                except json.JSONDecodeError as e:
                    print(f"Deepseek API 返回的JSON解析失败: {e}")
                    print(f"返回内容: {content}")
                    return None
            else:
                print(f"Deepseek API 错误: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"调用 Deepseek API 获取单词信息时出错: {str(e)}")
            return None

