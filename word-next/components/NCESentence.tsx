'use client';

import { forwardRef, useCallback, useState, useRef, useEffect } from 'react';
import { LrcLine, formatTime } from '@/utils/lrcParser';

type HideMode = 'none' | 'english' | 'chinese' | 'both';
type SentenceStatus = 'understood' | 'not-understood' | undefined;

interface NCESentenceProps {
  line: LrcLine;
  index: number;
  isActive: boolean;
  hideMode: HideMode;
  status: SentenceStatus;
  onPlay: () => void;
  onStatusChange: (status: 'understood' | 'not-understood') => void;
  onTextSelect: (word: string, x: number, y: number) => void;
}

const NCESentence = forwardRef<HTMLDivElement, NCESentenceProps>(
  ({ line, index, isActive, hideMode, status, onPlay, onStatusChange, onTextSelect }, ref) => {
    const [showEnglish, setShowEnglish] = useState(false);
    const [showChinese, setShowChinese] = useState(false);
    const [longPressWord, setLongPressWord] = useState<{ word: string; x: number; y: number } | null>(null);
    
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const touchStartPos = useRef<{ x: number; y: number } | null>(null);

    // 清理定时器
    useEffect(() => {
      return () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      };
    }, []);

    // 从触摸位置获取单词
    const getWordAtPosition = useCallback((x: number, y: number): string | null => {
      const element = document.elementFromPoint(x, y);
      if (!element) return null;
      
      // 获取文本节点
      const range = document.caretRangeFromPoint?.(x, y);
      if (!range) return null;
      
      const textContent = range.startContainer.textContent;
      if (!textContent) return null;
      
      // 找到单词边界
      const offset = range.startOffset;
      let start = offset;
      let end = offset;
      
      // 向前找单词开始
      while (start > 0 && /[a-zA-Z'-]/.test(textContent[start - 1])) {
        start--;
      }
      
      // 向后找单词结束
      while (end < textContent.length && /[a-zA-Z'-]/.test(textContent[end])) {
        end++;
      }
      
      const word = textContent.slice(start, end).trim();
      return /^[a-zA-Z'-]+$/.test(word) ? word : null;
    }, []);

    // 长按开始（触摸）
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      
      longPressTimer.current = setTimeout(() => {
        const word = getWordAtPosition(touch.clientX, touch.clientY);
        if (word) {
          e.preventDefault();
          setLongPressWord({ word, x: touch.clientX, y: touch.clientY });
          onTextSelect(word, touch.clientX, touch.clientY);
          // 震动反馈（如果支持）
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }
      }, 500); // 500ms 长按
    }, [getWordAtPosition, onTextSelect]);

    // 触摸移动 - 取消长按
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (longPressTimer.current && touchStartPos.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.current.x);
        const dy = Math.abs(touch.clientY - touchStartPos.current.y);
        // 移动超过 10px 取消长按
        if (dx > 10 || dy > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }, []);

    // 触摸结束
    const handleTouchEnd = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      touchStartPos.current = null;
    }, []);

    // 桌面端：处理文本选择
    const handleMouseUp = useCallback((e: React.MouseEvent) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selectedText && selectedText.length > 0 && selectedText.length < 50) {
        // 只处理英文单词
        if (/^[a-zA-Z'-]+$/.test(selectedText)) {
          onTextSelect(selectedText, e.clientX, e.clientY);
        }
      }
    }, [onTextSelect]);

    // 判断是否隐藏英文
    const isEnglishHidden = hideMode === 'english' || hideMode === 'both';
    const isChineseHidden = hideMode === 'chinese' || hideMode === 'both';

    // 在隐藏模式下是否显示（通过点击切换）
    const shouldShowEnglish = !isEnglishHidden || showEnglish;
    const shouldShowChinese = !isChineseHidden || showChinese;

    return (
      <div
        ref={ref}
        className={`group relative p-3 sm:p-4 rounded-xl transition-all duration-300 cursor-pointer ${
          isActive
            ? 'bg-purple-600/30 border-2 border-purple-500 shadow-lg shadow-purple-500/20'
            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
        onClick={onPlay}
      >
        {/* 句子编号和时间 */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`text-xs font-mono ${isActive ? 'text-purple-300' : 'text-white/40'}`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={`text-xs font-mono hidden sm:inline ${isActive ? 'text-purple-300' : 'text-white/40'}`}>
              {line.startTime}
            </span>
          </div>

          {/* 状态按钮（仅在隐藏模式下显示） */}
          {(hideMode !== 'none') && (
            <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onStatusChange('understood')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  status === 'understood'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/50 hover:bg-green-600/50 hover:text-white'
                }`}
                title="听懂了"
              >
                ✓
              </button>
              <button
                onClick={() => onStatusChange('not-understood')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  status === 'not-understood'
                    ? 'bg-red-600 text-white'
                    : 'bg-white/10 text-white/50 hover:bg-red-600/50 hover:text-white'
                }`}
                title="没听懂"
              >
                ✗
              </button>
            </div>
          )}
        </div>

        {/* 英文内容 */}
        <div className="mb-2">
          {shouldShowEnglish ? (
            <p
              className={`text-base sm:text-lg leading-relaxed select-text ${
                isActive ? 'text-white font-medium' : 'text-white/90'
              }`}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {line.english}
            </p>
          ) : (
            <div
              className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowEnglish(true);
                setTimeout(() => setShowEnglish(false), 3000);
              }}
            >
              <span className="text-lg">🔒</span>
              <span className="text-sm">点击显示英文</span>
              {status === 'understood' && (
                <span className="ml-2 px-2 py-0.5 bg-green-600/50 text-green-200 text-xs rounded">✓</span>
              )}
              {status === 'not-understood' && (
                <span className="ml-2 px-2 py-0.5 bg-red-600/50 text-red-200 text-xs rounded">✗</span>
              )}
            </div>
          )}
        </div>

        {/* 中文翻译 */}
        {line.chinese && (
          <div>
            {shouldShowChinese ? (
              <p className={`text-sm leading-relaxed ${
                isActive ? 'text-purple-200' : 'text-white/50'
              }`}>
                {line.chinese}
              </p>
            ) : (
              <div
                className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChinese(true);
                  setTimeout(() => setShowChinese(false), 3000);
                }}
              >
                <span className="text-sm">🔒</span>
                <span className="text-xs">点击显示中文</span>
              </div>
            )}
          </div>
        )}

        {/* 播放指示器 */}
        {isActive && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-6 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* 状态指示器 */}
        {status && (
          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
            status === 'understood' ? 'bg-green-500' : 'bg-red-500'
          }`} />
        )}
      </div>
    );
  }
);

NCESentence.displayName = 'NCESentence';

export default NCESentence;

