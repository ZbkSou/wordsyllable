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
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBookInfo = (book: number) => {
    const info = {
      1: { name: 'First Things First', desc: '英语初阶', color: 'from-green-500 to-emerald-600' },
      2: { name: 'Practice & Progress', desc: '实践与进步', color: 'from-blue-500 to-cyan-600' },
      3: { name: 'Developing Skills', desc: '培养技能', color: 'from-purple-500 to-pink-600' },
      4: { name: 'Fluency in English', desc: '流利英语', color: 'from-orange-500 to-red-600' },
    };
    return info[book as keyof typeof info] || info[1];
  };

  const bookInfo = getBookInfo(book);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-white/60">加载课程列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-16">
      {/* 册别信息卡片 */}
      <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r ${bookInfo.color} shadow-xl`}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
              新概念英语 第{book}册
            </h2>
            <p className="text-white/80 text-sm sm:text-lg">{bookInfo.name}</p>
            <p className="text-white/60 text-xs sm:text-base">{bookInfo.desc}</p>
          </div>
          <div className="text-4xl sm:text-6xl opacity-80 flex-shrink-0">
            {book === 1 && '🌱'}
            {book === 2 && '📖'}
            {book === 3 && '🎯'}
            {book === 4 && '🏆'}
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center gap-4 text-white/80 text-sm sm:text-base">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            共 {lessons.length} 课
          </span>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索课程..."
          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 课程列表 */}
      <div className="grid gap-2 sm:gap-3">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-white/50 text-sm sm:text-base">
            {searchQuery ? '未找到匹配的课程' : '暂无课程'}
          </div>
        ) : (
          filteredLessons.map((lesson, index) => {
            const lessonNumber = lesson.filename.match(/^(\d+)/)?.[1] || String(index + 1);
            
            return (
              <button
                key={index}
                onClick={() => onLessonSelect(lesson)}
                className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-white/10 active:bg-white/15 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-lg sm:rounded-xl transition-all duration-200 text-left"
              >
                {/* 课程编号 */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-purple-600/30 group-hover:bg-purple-600/50 rounded-lg text-purple-300 font-bold text-sm sm:text-base transition-colors">
                  {lessonNumber}
                </div>
                
                {/* 课程标题 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm sm:text-base font-medium truncate group-hover:text-purple-300 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-white/40 text-xs sm:text-sm truncate hidden sm:block">
                    {lesson.filename}
                  </p>
                </div>

                {/* 播放图标 */}
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-purple-600/0 group-hover:bg-purple-600 rounded-full transition-all duration-200">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white/30 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

