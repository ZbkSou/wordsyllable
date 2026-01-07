'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson } from '@/app/nce/page';
import { parseLrc, ParsedLrc, formatTime, buildNCEUrl, getCurrentLineIndex } from '@/utils/lrcParser';
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

export default function NCEPlayer({ book, lesson, onBack, isLoggedIn = false }: NCEPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playMode, setPlayMode] = useState<PlayMode>('sequential');
  
  const [lrcData, setLrcData] = useState<ParsedLrc | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [hideMode, setHideMode] = useState<HideMode>('none');
  const [autoScroll, setAutoScroll] = useState(true);
  
  const [selectedWord, setSelectedWord] = useState('');
  const [lookupPosition, setLookupPosition] = useState({ x: 0, y: 0 });
  const [showLookup, setShowLookup] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const audioUrl = buildNCEUrl(book, lesson.filename, 'mp3');
  const lrcUrl = buildNCEUrl(book, lesson.filename, 'lrc');

  // 加载 LRC 文件
  useEffect(() => {
    const loadLrc = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(lrcUrl);
        if (!response.ok) throw new Error('加载课文失败');
        
        const text = await response.text();
        if (text.startsWith('{') && text.includes('"error"')) {
          throw new Error(JSON.parse(text).error || '加载失败');
        }
        
        const parsed = parseLrc(text);
        if (parsed.lines.length === 0) throw new Error('课文解析失败');
        
        setLrcData(parsed);
        sentenceRefs.current = new Array(parsed.lines.length).fill(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadLrc();
  }, [lrcUrl]);

  // 更新当前行
  useEffect(() => {
    if (lrcData && lrcData.lines.length > 0) {
      const newIndex = getCurrentLineIndex(lrcData.lines, currentTime);
      if (newIndex !== currentLineIndex) {
        setCurrentLineIndex(newIndex);
        if (autoScroll && newIndex >= 0 && sentenceRefs.current[newIndex]) {
          sentenceRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, lrcData, currentLineIndex, autoScroll]);

  // 单句循环
  useEffect(() => {
    if (!audioRef.current || !lrcData || !isPlaying || playMode !== 'single-loop') return;
    
    const lines = lrcData.lines;
    if (currentLineIndex >= 0 && currentLineIndex < lines.length) {
      const nextTime = currentLineIndex < lines.length - 1 ? lines[currentLineIndex + 1].time : duration;
      if (currentTime >= nextTime - 0.1) {
        audioRef.current.currentTime = lines[currentLineIndex].time;
      }
    }
  }, [currentTime, currentLineIndex, playMode, lrcData, isPlaying, duration]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

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

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const handleTextSelection = useCallback((word: string, x: number, y: number) => {
    if (word.trim()) {
      setSelectedWord(word.trim());
      setLookupPosition({ x, y });
      setShowLookup(true);
    }
  }, []);

  const closeLookup = useCallback(() => {
    setShowLookup(false);
    setSelectedWord('');
  }, []);

  const prevSentence = useCallback(() => {
    if (currentLineIndex > 0) seekToSentence(currentLineIndex - 1);
  }, [currentLineIndex, seekToSentence]);

  const nextSentence = useCallback(() => {
    if (lrcData && currentLineIndex < lrcData.lines.length - 1) seekToSentence(currentLineIndex + 1);
  }, [currentLineIndex, lrcData, seekToSentence]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); prevSentence(); break;
        case 'ArrowRight': e.preventDefault(); nextSentence(); break;
        case 'KeyR': e.preventDefault(); if (currentLineIndex >= 0) seekToSentence(currentLineIndex); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, prevSentence, nextSentence, currentLineIndex, seekToSentence]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-purple-600 text-white rounded-lg">返回</button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => {
          if (playMode === 'all-loop' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else setIsPlaying(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 课程信息 */}
      <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <h2 className="text-lg font-bold text-white truncate">{lesson.title}</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
          <span>第{book}册</span>
          <span>•</span>
          <span>{lrcData?.lines.length || 0}句</span>
          <span>•</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
        {/* 进度条 */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="text-white/60 text-xs w-10">{formatTime(duration)}</span>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={prevSentence} className="w-10 h-10 flex items-center justify-center text-white/70 active:bg-white/20 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>
          <button onClick={togglePlay} className="w-14 h-14 flex items-center justify-center bg-purple-600 text-white rounded-full shadow-lg">
            {isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button onClick={nextSentence} className="w-10 h-10 flex items-center justify-center text-white/70 active:bg-white/20 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
          <button onClick={() => currentLineIndex >= 0 && seekToSentence(currentLineIndex)} className="w-10 h-10 flex items-center justify-center text-white/70 active:bg-white/20 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* 速度和模式 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/50">速度</span>
          {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-1 rounded ${playbackRate === rate ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'}`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/50">模式</span>
          {[
            { mode: 'sequential' as const, label: '连续' },
            { mode: 'single-loop' as const, label: '单句' },
            { mode: 'all-loop' as const, label: '循环' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setPlayMode(mode)}
              className={`px-2 py-1 rounded ${playMode === mode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'}`}
            >
              {label}
            </button>
          ))}
          
          <span className="text-white/50 ml-2">显示</span>
          {[
            { mode: 'none' as const, label: '全部' },
            { mode: 'chinese' as const, label: '隐中' },
            { mode: 'english' as const, label: '隐英' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setHideMode(mode)}
              className={`px-2 py-1 rounded ${hideMode === mode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'}`}
            >
              {label}
            </button>
          ))}
          
          <label className="flex items-center gap-1 ml-auto">
            <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="w-3 h-3" />
            <span className="text-white/50">滚动</span>
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
            onPlay={() => seekToSentence(index)}
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

      {/* 提示 */}
      <div className="fixed bottom-14 left-0 right-0 text-center text-white/30 text-xs py-2">
        💡 长按单词可查询释义
      </div>
    </div>
  );
}

