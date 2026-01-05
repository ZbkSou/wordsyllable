'use client';

import { useState, useEffect, useRef } from 'react';
import { wordsAPI, Word } from '@/utils/api';

interface WordLookupPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  isLoggedIn?: boolean;
}

export default function WordLookupPopup({ word, position, onClose, isLoggedIn = false }: WordLookupPopupProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wordData, setWordData] = useState<Word | null>(null);
  const [action, setAction] = useState<'queried' | 'added' | 'not_found' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState({ left: 0, top: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 计算弹窗位置（只在客户端执行）
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      setAdjustedPosition({
        left: Math.min(position.x, window.innerWidth - 380),
        top: Math.min(position.y + 10, window.innerHeight - 400),
      });
    }
  }, [position, mounted]);

  // 查询单词
  useEffect(() => {
    const lookupWord = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (isLoggedIn) {
          // 已登录：调用需要认证的接口，记录查询次数
          const response = await wordsAPI.lookupWord({ word: word.toLowerCase() });
          setWordData(response.data.word);
          setAction(response.data.action);
        } else {
          // 未登录：调用公开接口，不记录次数
          const response = await wordsAPI.publicLookupWord({ word: word.toLowerCase() });
          setWordData(response.data.word);
          setAction(response.data.action);
        }
      } catch (err: any) {
        console.error('查询单词失败:', err);
        if (err.response?.status === 404) {
          setAction('not_found');
          setError('单词未收录');
        } else {
          setError(err.response?.data?.error || '查询失败');
        }
      } finally {
        setLoading(false);
      }
    };

    if (word) {
      lookupWord();
    }
  }, [word, isLoggedIn]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 未挂载时不渲染
  if (!mounted) {
    return null;
  }

  // 计算弹窗位置
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: adjustedPosition.left,
    top: adjustedPosition.top,
    zIndex: 100,
  };

  return (
    <div
      ref={popupRef}
      style={popupStyle}
      className="w-80 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
    >
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📖</span>
          <span className="text-white font-bold">{word}</span>
          {action && action !== 'not_found' && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              action === 'added' 
                ? 'bg-green-500/50 text-green-100' 
                : 'bg-blue-500/50 text-blue-100'
            }`}>
              {action === 'added' ? '已添加' : '已存在'}
            </span>
          )}
          {!isLoggedIn && (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/50 text-yellow-100">
              游客
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 内容 */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-400 text-sm">{error}</p>
            {action === 'not_found' && !isLoggedIn && (
              <p className="text-white/40 text-xs mt-2">登录后可自动添加新单词</p>
            )}
          </div>
        ) : wordData ? (
          <div className="space-y-3">
            {/* 音标 */}
            {wordData.phonetic && (
              <div>
                <p className="text-purple-300 text-sm">{wordData.phonetic}</p>
              </div>
            )}

            {/* 翻译 */}
            <div>
              <p className="text-white font-medium">{wordData.translation}</p>
            </div>

            {/* 音节 */}
            {wordData.syllables && wordData.syllables.length > 0 && (
              <div>
                <p className="text-white/50 text-xs mb-1">音节</p>
                <div className="flex flex-wrap gap-1">
                  {wordData.syllables.map((syllable, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-purple-600/30 text-purple-200 rounded text-sm"
                    >
                      {syllable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 自然拼读解析 */}
            {wordData.phonetic_analysis && (
              <div>
                <p className="text-white/50 text-xs mb-1">📘 自然拼读</p>
                <p className="text-sm text-blue-200 bg-blue-900/30 p-2 rounded border-l-2 border-blue-500">
                  {wordData.phonetic_analysis}
                </p>
              </div>
            )}

            {/* 词根词缀 */}
            {wordData.root_affix && (
              <div>
                <p className="text-white/50 text-xs mb-1">🟧 词根词缀</p>
                <p className="text-sm text-orange-200 bg-orange-900/30 p-2 rounded border-l-2 border-orange-500">
                  {wordData.root_affix}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-2 bg-white/5 border-t border-white/10 text-center">
        <p className="text-white/30 text-xs">
          {isLoggedIn ? '查询已记录' : '游客模式（不记录查询）'} · Esc 关闭
        </p>
      </div>
    </div>
  );
}

