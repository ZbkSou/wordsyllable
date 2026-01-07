'use client';

import { useState, useEffect } from 'react';
import { Lesson, NCEData } from '@/app/nce/page';

interface NCELessonListProps {
  book: number;
  onLessonSelect: (lesson: Lesson) => void;
}

export default function NCELessonList({ book, onLessonSelect }: NCELessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLessons();
  }, [book]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/nec_data.json');
      const data: NCEData = await response.json();
      setLessons(data[book.toString()] || []);
    } catch (error) {
      console.error('加载课程列表失败:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bookColors: Record<number, string> = {
    1: 'from-green-500 to-emerald-600',
    2: 'from-blue-500 to-cyan-600',
    3: 'from-purple-500 to-pink-600',
    4: 'from-orange-500 to-red-600',
  };

  const bookEmojis: Record<number, string> = {
    1: '🌱', 2: '📖', 3: '🎯', 4: '🏆'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 册别信息 */}
      <div className={`p-4 rounded-xl bg-gradient-to-r ${bookColors[book]} shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">新概念第{book}册</h2>
            <p className="text-white/70 text-sm mt-1">共 {lessons.length} 课</p>
          </div>
          <span className="text-4xl">{bookEmojis[book]}</span>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索课程..."
          className="w-full px-4 py-2.5 pl-10 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 课程列表 */}
      <div className="space-y-2">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-10 text-white/50">
            {searchQuery ? '未找到匹配的课程' : '暂无课程'}
          </div>
        ) : (
          filteredLessons.map((lesson, index) => {
            const num = lesson.filename.match(/^(\d+)/)?.[1] || String(index + 1);
            return (
              <button
                key={index}
                onClick={() => onLessonSelect(lesson)}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-lg transition-all text-left"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-purple-600/30 rounded-lg text-purple-300 font-bold text-sm">
                  {num}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium truncate">{lesson.title}</h3>
                </div>
                <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

