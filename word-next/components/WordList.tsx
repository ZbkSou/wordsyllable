'use client';

import { useState, useEffect } from 'react';
import { wordsAPI, Word } from '@/lib/api';

interface WordListProps {
  refresh: number;
}

export default function WordList({ refresh }: WordListProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Word | null>(null);

  useEffect(() => {
    fetchWords();
  }, [page, refresh]);

  const fetchWords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wordsAPI.getWords(page, 20);
      setWords(response.data.words);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      setError('加载单词列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await wordsAPI.searchWord(searchQuery.trim());
      setSearchResult(response.data.word);
    } catch (err: any) {
      setError(err.response?.data?.error || '未找到该单词');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setError('');
  };

  return (
    <div className="w-full max-w-4xl">
      {/* 搜索框 */}
      <div className="mb-6 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索单词..."
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            搜索
          </button>
          {searchResult && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-6 py-2 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              清除
            </button>
          )}
        </form>
      </div>

      {/* 搜索结果 */}
      {searchResult && (
        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-lg border-2 border-green-500">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">搜索结果</h3>
          <WordCard word={searchResult} />
          {searchResult.query_count !== undefined && (
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              查询次数：{searchResult.query_count} 次
            </p>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && !searchResult && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 单词列表 */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">单词列表</h2>
          <button
            onClick={fetchWords}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors text-sm"
          >
            刷新
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-500">加载中...</div>
        ) : words.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">暂无单词</div>
        ) : (
          <>
            <div className="space-y-3">
              {words.map((word) => (
                <WordCard key={word.id} word={word} />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  上一页
                </button>
                <span className="text-zinc-700 dark:text-zinc-300">
                  第 {page} / {totalPages} 页
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WordCard({ word }: { word: Word }) {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {word.word}
          </h3>
          {word.phonetic && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {word.phonetic}
            </p>
          )}
          <p className="text-zinc-700 dark:text-zinc-300 mt-2">
            {word.translation}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {word.syllables.map((syllable, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {syllable}
              </span>
            ))}
          </div>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-500 ml-4">
          ID: {word.id}
        </span>
      </div>
    </div>
  );
}

