'use client';

import { forwardRef, useCallback, useState, useRef, useEffect } from 'react';
import { LrcLine } from '@/utils/lrcParser';

type HideMode = 'none' | 'english' | 'chinese' | 'both';

interface NCESentenceProps {
  line: LrcLine;
  index: number;
  isActive: boolean;
  hideMode: HideMode;
  onPlay: () => void;
  onTextSelect: (word: string, x: number, y: number) => void;
}

const NCESentence = forwardRef<HTMLDivElement, NCESentenceProps>(
  ({ line, index, isActive, hideMode, onPlay, onTextSelect }, ref) => {
    const [showEnglish, setShowEnglish] = useState(false);
    const [showChinese, setShowChinese] = useState(false);
    
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const touchStartPos = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
      return () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
      };
    }, []);

    // 从触摸位置获取单词
    const getWordAtPosition = useCallback((x: number, y: number): string | null => {
      const range = document.caretRangeFromPoint?.(x, y);
      if (!range) return null;
      
      const textContent = range.startContainer.textContent;
      if (!textContent) return null;
      
      const offset = range.startOffset;
      let start = offset, end = offset;
      
      while (start > 0 && /[a-zA-Z'-]/.test(textContent[start - 1])) start--;
      while (end < textContent.length && /[a-zA-Z'-]/.test(textContent[end])) end++;
      
      const word = textContent.slice(start, end).trim();
      return /^[a-zA-Z'-]+$/.test(word) ? word : null;
    }, []);

    // 长按触发
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      
      longPressTimer.current = setTimeout(() => {
        const word = getWordAtPosition(touch.clientX, touch.clientY);
        if (word) {
          e.preventDefault();
          onTextSelect(word, touch.clientX, touch.clientY);
          if (navigator.vibrate) navigator.vibrate(50);
        }
      }, 500);
    }, [getWordAtPosition, onTextSelect]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (longPressTimer.current && touchStartPos.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.current.x);
        const dy = Math.abs(touch.clientY - touchStartPos.current.y);
        if (dx > 10 || dy > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }, []);

    const handleTouchEnd = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      touchStartPos.current = null;
    }, []);

    // 桌面端选择
    const handleMouseUp = useCallback((e: React.MouseEvent) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && /^[a-zA-Z'-]+$/.test(selectedText)) {
        onTextSelect(selectedText, e.clientX, e.clientY);
      }
    }, [onTextSelect]);

    const isEnglishHidden = hideMode === 'english' || hideMode === 'both';
    const isChineseHidden = hideMode === 'chinese' || hideMode === 'both';
    const shouldShowEnglish = !isEnglishHidden || showEnglish;
    const shouldShowChinese = !isChineseHidden || showChinese;

    return (
      <div
        ref={ref}
        className={`relative p-3 rounded-lg transition-all cursor-pointer ${
          isActive
            ? 'bg-purple-600/30 border-2 border-purple-500'
            : 'bg-white/5 border border-white/10 active:bg-white/10'
        }`}
        onClick={onPlay}
      >
        {/* 编号 */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-mono ${isActive ? 'text-purple-300' : 'text-white/40'}`}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* 英文 */}
        <div className="mb-1">
          {shouldShowEnglish ? (
            <p
              className={`text-sm leading-relaxed select-text ${isActive ? 'text-white font-medium' : 'text-white/90'}`}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {line.english}
            </p>
          ) : (
            <div
              className="text-white/40 text-sm"
              onClick={(e) => { e.stopPropagation(); setShowEnglish(true); setTimeout(() => setShowEnglish(false), 3000); }}
            >
              🔒 点击显示英文
            </div>
          )}
        </div>

        {/* 中文 */}
        {line.chinese && (
          <div>
            {shouldShowChinese ? (
              <p className={`text-xs leading-relaxed ${isActive ? 'text-purple-200' : 'text-white/50'}`}>
                {line.chinese}
              </p>
            ) : (
              <div
                className="text-white/30 text-xs"
                onClick={(e) => { e.stopPropagation(); setShowChinese(true); setTimeout(() => setShowChinese(false), 3000); }}
              >
                🔒 点击显示中文
              </div>
            )}
          </div>
        )}

        {/* 播放指示器 */}
        {isActive && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <span className="w-0.5 h-3 bg-purple-400 rounded-full animate-pulse" />
            <span className="w-0.5 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    );
  }
);

NCESentence.displayName = 'NCESentence';

export default NCESentence;

