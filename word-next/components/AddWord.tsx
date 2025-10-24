'use client';

import { useState } from 'react';
import { wordsAPI } from '@/utils/api';

interface AddWordProps {
  onWordAdded: () => void;
}

export default function AddWord({ onWordAdded }: AddWordProps) {
  const [mode, setMode] = useState<'auto' | 'manual' | 'json'>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [autoFormData, setAutoFormData] = useState({ word: '' });
  const [manualFormData, setManualFormData] = useState({
    word: '',
    syllables: '',
    translation: '',
    phonetic: '',
  });
  const [jsonFormData, setJsonFormData] = useState('');

  const handleAutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await wordsAPI.addWord({ word: autoFormData.word.toLowerCase().trim() });
      setSuccess(`单词 "${response.data.word.word}" 添加成功！音节：${response.data.word.syllables.join(' · ')}`);
      setAutoFormData({ word: '' });
      onWordAdded();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || '添加失败';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const syllablesArray = manualFormData.syllables
        .split(/[\s,，]+/)
        .filter(s => s.trim())
        .map(s => s.trim());

      if (syllablesArray.length === 0) {
        setError('请输入音节');
        setLoading(false);
        return;
      }

      const response = await wordsAPI.addWord({
        word: manualFormData.word.toLowerCase().trim(),
        syllables: syllablesArray,
        translation: manualFormData.translation.trim(),
        phonetic: manualFormData.phonetic.trim() || undefined,
      });

      setSuccess(`单词 "${response.data.word.word}" 添加成功！`);
      setManualFormData({ word: '', syllables: '', translation: '', phonetic: '' });
      onWordAdded();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || '添加失败';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 解析 JSON
      const jsonData = JSON.parse(jsonFormData.trim());

      // 验证必需字段
      if (!jsonData.word) {
        setError('JSON 中缺少 word 字段');
        setLoading(false);
        return;
      }

      // 检查是否有 syllables 字段（手动模式）
      if (jsonData.syllables && Array.isArray(jsonData.syllables)) {
        // 手动模式：需要 translation
        if (!jsonData.translation) {
          setError('手动模式下，JSON 中需要包含 translation 字段');
          setLoading(false);
          return;
        }

        const response = await wordsAPI.addWord({
          word: jsonData.word.toLowerCase().trim(),
          syllables: jsonData.syllables.map((s: string) => s.trim()),
          translation: jsonData.translation.trim(),
          phonetic: jsonData.phonetic?.trim() || undefined,
        });

        setSuccess(`单词 "${response.data.word.word}" 添加成功（手动模式）！`);
      } else {
        // AI 自动模式：只有 word 字段
        const response = await wordsAPI.addWord({
          word: jsonData.word.toLowerCase().trim(),
        });

        setSuccess(`单词 "${response.data.word.word}" 添加成功（AI 自动模式）！音节：${response.data.word.syllables.join(' · ')}`);
      }

      setJsonFormData('');
      onWordAdded();
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('JSON 格式错误，请检查格式是否正确');
      } else {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || '添加失败';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">添加单词</h2>
      
      {/* 模式切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setMode('auto');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
            mode === 'auto'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          🤖 AI自动
        </button>
        <button
          onClick={() => {
            setMode('manual');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
            mode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          ✏️ 手动
        </button>
        <button
          onClick={() => {
            setMode('json');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
            mode === 'json'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          📋 JSON
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* AI自动模式 */}
      {mode === 'auto' && (
        <form onSubmit={handleAutoSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              输入单词（AI将自动获取音标、翻译和音节）
            </label>
            <input
              type="text"
              value={autoFormData.word}
              onChange={(e) => setAutoFormData({ word: e.target.value })}
              required
              placeholder="例如：conversation"
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? '正在处理...' : '添加单词'}
          </button>
        </form>
      )}

      {/* 手动模式 */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              单词
            </label>
            <input
              type="text"
              value={manualFormData.word}
              onChange={(e) => setManualFormData({ ...manualFormData, word: e.target.value })}
              required
              placeholder="例如：conversation"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              音节（用空格或逗号分隔）
            </label>
            <input
              type="text"
              value={manualFormData.syllables}
              onChange={(e) => setManualFormData({ ...manualFormData, syllables: e.target.value })}
              required
              placeholder="例如：con ver sa tion"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              翻译
            </label>
            <input
              type="text"
              value={manualFormData.translation}
              onChange={(e) => setManualFormData({ ...manualFormData, translation: e.target.value })}
              required
              placeholder="例如：会话，谈话"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              音标（可选）
            </label>
            <input
              type="text"
              value={manualFormData.phonetic}
              onChange={(e) => setManualFormData({ ...manualFormData, phonetic: e.target.value })}
              placeholder="例如：/ˌkɒnvəˈseɪʃən/"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? '正在添加...' : '添加单词'}
          </button>
        </form>
      )}

      {/* JSON 模式 */}
      {mode === 'json' && (
        <form onSubmit={handleJsonSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              粘贴 JSON 格式的单词数据
            </label>
            <textarea
              value={jsonFormData}
              onChange={(e) => setJsonFormData(e.target.value)}
              required
              rows={10}
              placeholder={`支持两种格式：

1. AI 自动模式（只需 word 字段）：
{
  "word": "conversation"
}

2. 手动模式（完整字段）：
{
  "word": "conversation",
  "syllables": ["con", "ver", "sa", "tion"],
  "translation": "会话，谈话",
  "phonetic": "/ˌkɒnvəˈseɪʃən/"
}`}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100 font-mono text-sm"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 提示：
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-4 space-y-1">
              <li>• 只有 word 字段时，使用 AI 自动获取模式</li>
              <li>• 包含 syllables 和 translation 时，使用手动添加模式</li>
              <li>• phonetic（音标）字段是可选的</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? '正在解析并添加...' : '解析并添加单词'}
          </button>
        </form>
      )}
    </div>
  );
}

