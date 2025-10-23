'use client';

import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import AddWord from '@/components/AddWord';
import WordList from '@/components/WordList';
import Statistics from '@/components/Statistics';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'stats'>('add');
  const [wordListRefresh, setWordListRefresh] = useState(0);

  useEffect(() => {
    // 检查本地存储中的认证信息
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setUsername(JSON.parse(user).username);
    }
  }, []);

  const handleAuthSuccess = () => {
    const user = localStorage.getItem('user');
    if (user) {
      setUsername(JSON.parse(user).username);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUsername('');
  };

  const handleWordAdded = () => {
    setWordListRefresh(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-950 dark:via-blue-950 dark:to-indigo-950 p-4">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-950 dark:via-blue-950 dark:to-indigo-950">
      {/* 顶部导航栏 */}
      <nav className="bg-white dark:bg-zinc-900 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                单词记忆助手
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-700 dark:text-zinc-300">
                欢迎, <span className="font-semibold">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab导航 */}
        <div className="flex gap-2 mb-8 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-lg">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            ➕ 添加单词
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            📖 单词列表
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            📊 统计数据
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex justify-center">
          {activeTab === 'add' && <AddWord onWordAdded={handleWordAdded} />}
          {activeTab === 'list' && <WordList refresh={wordListRefresh} />}
          {activeTab === 'stats' && <Statistics />}
        </div>
      </div>

      {/* 页脚 */}
      <footer className="mt-16 py-6 text-center text-zinc-600 dark:text-zinc-400 text-sm">
        <p>单词记忆助手 - 基于音节分词的英语单词记忆工具</p>
        <p className="mt-1">支持 AI 自动获取和手动添加两种模式</p>
      </footer>
    </div>
  );
}
