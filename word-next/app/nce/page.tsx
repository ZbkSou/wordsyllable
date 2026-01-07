'use client';

import { useState, useEffect } from 'react';
import NCELessonList from '@/components/NCELessonList';
import NCEPlayer from '@/components/NCEPlayer';
import { authAPI, User } from '@/utils/api';

export interface Lesson {
  title: string;
  filename: string;
}

export interface NCEData {
  [book: string]: Lesson[];
}

export default function NCEPage() {
  const [selectedBook, setSelectedBook] = useState<number>(2);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleBackToList = () => {
    setSelectedLesson(null);
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setLoginError('请输入用户名和密码');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await authAPI.login(loginForm);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setLoginError(error.response?.data?.error || '登录失败');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 头部 */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          {/* 第一行：标题和登录 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {selectedLesson && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-1 px-2 py-1.5 text-white/70 hover:text-white active:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">返回</span>
                </button>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📚</span>
                <span>新概念听力</span>
              </h1>
            </div>
            
            {/* 登录/用户信息 */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-xs sm:text-sm">👤 {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 text-xs bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium"
              >
                登录
              </button>
            )}
          </div>
          
          {/* 第二行：册别选择 */}
          {!selectedLesson && (
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
              {[1, 2, 3, 4].map((book) => (
                <button
                  key={book}
                  onClick={() => setSelectedBook(book)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedBook === book
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/70 active:bg-white/20'
                  }`}
                >
                  第{book}册
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 pb-20">
        {selectedLesson ? (
          <NCEPlayer
            book={selectedBook}
            lesson={selectedLesson}
            onBack={handleBackToList}
            isLoggedIn={!!user}
          />
        ) : (
          <NCELessonList
            book={selectedBook}
            onLessonSelect={handleLessonSelect}
          />
        )}
      </main>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">登录</h2>
              <button
                onClick={() => { setShowLoginModal(false); setLoginError(''); }}
                className="text-white/50 hover:text-white p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="用户名"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="密码"
                />
              </div>

              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loginLoading ? '登录中...' : '登录'}
              </button>

              <p className="text-white/40 text-xs text-center">登录后查词将记录到您的账户</p>
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-white/10 py-2">
        <div className="text-center text-white/40 text-xs">
          音频来自 nce.ichochy.com
        </div>
      </footer>
    </div>
  );
}

