'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson } from '@/app/nce/page';
import { parseLrc, ParsedLrc, LrcLine, formatTime, buildNCEUrl, getCurrentLineIndex } from '@/utils/lrcParser';
import NCESentence from './NCESentence';
import WordLookupPopup from './WordLookupPopup';

interface NCEPlayerProps {
  book: number;
  lesson: Lesson;
  onBack: () => void;
  isLoggedIn?: boolean;
}

type PlayMode = 'sequential' | 'single-loop' | 'all-loop';
type HideMode = 'none' | 'english' | 'chinese' | 'both';

interface SentenceStatus {
  [index: number]: 'understood' | 'not-understood' | undefined;
}

export default function NCEPlayer({ book, lesson, onBack, isLoggedIn = false }: NCEPlayerProps) {
  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playMode, setPlayMode] = useState<PlayMode>('sequential');
  
  // LRC 状态
  const [lrcData, setLrcData] = useState<ParsedLrc | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 显示模式
  const [hideMode, setHideMode] = useState<HideMode>('none');
  const [autoScroll, setAutoScroll] = useState(true);
  
  // 句子状态（听懂/没听懂）
  const [sentenceStatus, setSentenceStatus] = useState<SentenceStatus>({});
  
  // 单词查询
  const [selectedWord, setSelectedWord] = useState('');
  const [lookupPosition, setLookupPosition] = useState({ x: 0, y: 0 });
  const [showLookup, setShowLookup] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 音频URL
  const audioUrl = buildNCEUrl(book, lesson.filename, 'mp3');
  const lrcUrl = buildNCEUrl(book, lesson.filename, 'lrc');

  // 加载 LRC 文件
  useEffect(() => {
    const loadLrc = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('正在加载 LRC:', lrcUrl);
        const response = await fetch(lrcUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('LRC 加载失败，状态码:', response.status, errorText);
          throw new Error(`加载课文失败: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('LRC 原始内容长度:', text.length);
        console.log('LRC 前200字符:', text.substring(0, 200));
        
        // 检查是否是 JSON 错误响应
        if (text.startsWith('{') && text.includes('"error"')) {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || '加载课文失败');
        }
        
        const parsed = parseLrc(text);
        console.log('解析结果 - 元数据:', parsed.metadata);
        console.log('解析结果 - 行数:', parsed.lines.length);
        
        if (parsed.lines.length === 0) {
          console.warn('解析结果为空，原始内容:', text);
          throw new Error('课文解析失败，请检查格式');
        }
        
        setLrcData(parsed);
        sentenceRefs.current = new Array(parsed.lines.length).fill(null);
      } catch (err) {
        console.error('加载 LRC 失败:', err);
        setError(err instanceof Error ? err.message : '加载课文失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadLrc();
  }, [lrcUrl]);

  // 更新当前行索引
  useEffect(() => {
    if (lrcData && lrcData.lines.length > 0) {
      const newIndex = getCurrentLineIndex(lrcData.lines, currentTime);
      if (newIndex !== currentLineIndex) {
        setCurrentLineIndex(newIndex);
        
        // 自动滚动到当前句子
        if (autoScroll && newIndex >= 0 && sentenceRefs.current[newIndex]) {
          sentenceRefs.current[newIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentTime, lrcData, currentLineIndex, autoScroll]);

  // 处理句子播放结束
  useEffect(() => {
    if (!audioRef.current || !lrcData || !isPlaying) return;
    
    const audio = audioRef.current;
    const lines = lrcData.lines;
    
    if (playMode === 'single-loop' && currentLineIndex >= 0 && currentLineIndex < lines.length) {
      const nextLineTime = currentLineIndex < lines.length - 1 
        ? lines[currentLineIndex + 1].time 
        : duration;
      
      if (currentTime >= nextLineTime - 0.1) {
        audio.currentTime = lines[currentLineIndex].time;
      }
    }
  }, [currentTime, currentLineIndex, playMode, lrcData, isPlaying, duration]);

  // 播放控制
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // 跳转到指定句子
  const seekToSentence = useCallback((index: number) => {
    if (audioRef.current && lrcData && index >= 0 && index < lrcData.lines.length) {
      audioRef.current.currentTime = lrcData.lines[index].time;
      setCurrentLineIndex(index);
      
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [lrcData, isPlaying]);

  // 进度条拖动
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // 音量调节
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  // 播放速度调节
  const handleRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // 更新句子状态
  const updateSentenceStatus = useCallback((index: number, status: 'understood' | 'not-understood') => {
    setSentenceStatus(prev => ({ ...prev, [index]: status }));
  }, []);

  // 处理文本选择
  const handleTextSelection = useCallback((word: string, x: number, y: number) => {
    if (word.trim()) {
      setSelectedWord(word.trim());
      setLookupPosition({ x, y });
      setShowLookup(true);
    }
  }, []);

  // 关闭单词查询
  const closeLookup = useCallback(() => {
    setShowLookup(false);
    setSelectedWord('');
  }, []);

  // 音频事件处理
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (playMode === 'all-loop' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
    }
  }, [playMode]);

  // 上一句/下一句
  const prevSentence = useCallback(() => {
    if (currentLineIndex > 0) {
      seekToSentence(currentLineIndex - 1);
    }
  }, [currentLineIndex, seekToSentence]);

  const nextSentence = useCallback(() => {
    if (lrcData && currentLineIndex < lrcData.lines.length - 1) {
      seekToSentence(currentLineIndex + 1);
    }
  }, [currentLineIndex, lrcData, seekToSentence]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          prevSentence();
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          nextSentence();
          break;
        case 'KeyR':
          e.preventDefault();
          if (currentLineIndex >= 0) {
            seekToSentence(currentLineIndex);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, prevSentence, nextSentence, currentLineIndex, seekToSentence]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-white/60">加载课文中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            返回目录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32" ref={containerRef}>
      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 课程信息 */}
      <div className="mb-6 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
        {lrcData?.metadata.title && (
          <p className="text-white/60">{lrcData.metadata.title}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
          <span>第 {book} 册</span>
          <span>•</span>
          <span>{lrcData?.lines.length || 0} 句</span>
          <span>•</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-4">
        {/* 进度条 */}
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm w-14 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-white/60 text-sm w-14">{formatTime(duration)}</span>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 上一句 */}
            <button
              onClick={prevSentence}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="上一句 (A/←)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* 播放/暂停 */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shadow-lg shadow-purple-500/30"
              title="播放/暂停 (Space)"
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* 下一句 */}
            <button
              onClick={nextSentence}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="下一句 (D/→)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* 重播当前句 */}
            <button
              onClick={() => currentLineIndex >= 0 && seekToSentence(currentLineIndex)}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="重播当前句 (R)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* 右侧控制 */}
          <div className="flex items-center gap-4">
            {/* 播放速度 */}
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-sm">速度</span>
              <div className="flex gap-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      playbackRate === rate
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* 音量 */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>
        </div>

        {/* 播放模式和显示选项 */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          {/* 播放模式 */}
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">模式</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPlayMode('sequential')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  playMode === 'sequential'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                连读
              </button>
              <button
                onClick={() => setPlayMode('single-loop')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  playMode === 'single-loop'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                单句循环
              </button>
              <button
                onClick={() => setPlayMode('all-loop')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  playMode === 'all-loop'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                整篇循环
              </button>
            </div>
          </div>

          {/* 显示模式 */}
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">显示</span>
            <div className="flex gap-1">
              <button
                onClick={() => setHideMode('none')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  hideMode === 'none'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setHideMode('chinese')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  hideMode === 'chinese'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                隐藏中文
              </button>
              <button
                onClick={() => setHideMode('english')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  hideMode === 'english'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                隐藏英文
              </button>
              <button
                onClick={() => setHideMode('both')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  hideMode === 'both'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                纯听力
              </button>
            </div>
          </div>

          {/* 自动滚动 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-white/50 text-sm">自动滚动</span>
          </label>
        </div>
      </div>

      {/* 课文内容 */}
      <div className="space-y-2">
        {lrcData?.lines.map((line, index) => (
          <NCESentence
            key={index}
            ref={(el) => { sentenceRefs.current[index] = el; }}
            line={line}
            index={index}
            isActive={index === currentLineIndex}
            hideMode={hideMode}
            status={sentenceStatus[index]}
            onPlay={() => seekToSentence(index)}
            onStatusChange={(status) => updateSentenceStatus(index, status)}
            onTextSelect={handleTextSelection}
          />
        ))}
      </div>

      {/* 单词查询弹窗 */}
      {showLookup && (
        <WordLookupPopup
          word={selectedWord}
          position={lookupPosition}
          onClose={closeLookup}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* 快捷键提示 */}
      <div className="fixed bottom-20 right-4 text-white/30 text-xs space-y-1">
        <p>Space: 播放/暂停</p>
        <p>←/A: 上一句</p>
        <p>→/D: 下一句</p>
        <p>R: 重播当前句</p>
      </div>
    </div>
  );
}

