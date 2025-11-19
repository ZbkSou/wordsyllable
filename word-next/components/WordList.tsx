'use client';

import { useState, useEffect } from 'react';
import { wordsAPI, Word } from '@/utils/api';

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
  const [searchType, setSearchType] = useState<'word' | 'syllable'>('word');
  const [searchResult, setSearchResult] = useState<Word | null>(null);
  const [syllableResults, setSyllableResults] = useState<Word[]>([]);
  const [currentSyllable, setCurrentSyllable] = useState('');
  const [syllablePage, setSyllablePage] = useState(1);
  const [syllableTotalPages, setSyllableTotalPages] = useState(1);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

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
    setSyllableResults([]);
    setCurrentSyllable('');

    try {
      if (searchType === 'word') {
        // 按单词搜索
        const response = await wordsAPI.searchWord(searchQuery.trim());
        setSearchResult(response.data.word);
      } else {
        // 按音节搜索
        await searchBySyllable(searchQuery.trim(), 1);
      }
    } catch (err: any) {
      if (searchType === 'word') {
        setError(err.response?.data?.error || '未找到该单词');
      } else {
        setError(err.response?.data?.error || '未找到包含该音节的单词');
      }
    } finally {
      setLoading(false);
    }
  };

  const searchBySyllable = async (syllable: string, page: number = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await wordsAPI.getWordsBySyllable(syllable, page, 50);
      setSyllableResults(response.data.words);
      setCurrentSyllable(syllable);
      setSyllablePage(page);
      setSyllableTotalPages(response.data.pages);
    } catch (err: any) {
      setError(err.response?.data?.error || '查询失败');
      setSyllableResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyllableClick = (syllable: string) => {
    setSearchQuery(syllable);
    setSearchType('syllable');
    setSearchResult(null);
    searchBySyllable(syllable, 1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setSyllableResults([]);
    setCurrentSyllable('');
    setError('');
  };

  const openWordDetail = (word: Word) => {
    setSelectedWord(word);
  };

  const closeWordDetail = () => {
    setSelectedWord(null);
  };

  return (
    <div className="w-full max-w-4xl">
      {/* 搜索框 */}
      <div className="mb-6 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
        <form onSubmit={handleSearch} className="space-y-3">
          {/* 搜索类型选择 */}
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="word"
                checked={searchType === 'word'}
                onChange={(e) => setSearchType(e.target.value as 'word' | 'syllable')}
                className="mr-2"
              />
              <span className="text-zinc-700 dark:text-zinc-300">按单词搜索</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="syllable"
                checked={searchType === 'syllable'}
                onChange={(e) => setSearchType(e.target.value as 'word' | 'syllable')}
                className="mr-2"
              />
              <span className="text-zinc-700 dark:text-zinc-300">按音节搜索</span>
            </label>
          </div>

          {/* 搜索输入框 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === 'word' ? '输入单词...' : '输入音节...'}
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              搜索
            </button>
            {(searchResult || syllableResults.length > 0) && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-2 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              >
                清除
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 单词搜索结果 */}
      {searchResult && (
        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-lg border-2 border-green-500">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">搜索结果</h3>
          <WordCard 
            word={searchResult} 
            onWordClick={openWordDetail}
            onSyllableClick={handleSyllableClick}
          />
          {searchResult.query_count !== undefined && (
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              查询次数：{searchResult.query_count} 次
            </p>
          )}
        </div>
      )}

      {/* 音节搜索结果 */}
      {syllableResults.length > 0 && (
        <div className="mb-6 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl shadow-lg border-2 border-purple-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">
              包含音节 "{currentSyllable}" 的单词 ({syllableResults.length} 个)
            </h3>
          </div>
          
          <div className="space-y-3">
            {syllableResults.map((word) => (
              <WordCard 
                key={word.id} 
                word={word}
                onWordClick={openWordDetail}
                onSyllableClick={handleSyllableClick}
                highlightSyllable={currentSyllable}
              />
            ))}
          </div>

          {/* 音节搜索分页 */}
          {syllableTotalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => searchBySyllable(currentSyllable, Math.max(1, syllablePage - 1))}
                disabled={syllablePage === 1}
                className="px-4 py-2 bg-purple-200 dark:bg-purple-700 hover:bg-purple-300 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-purple-900 dark:text-purple-100"
              >
                上一页
              </button>
              <span className="text-purple-700 dark:text-purple-300">
                第 {syllablePage} / {syllableTotalPages} 页
              </span>
              <button
                onClick={() => searchBySyllable(currentSyllable, Math.min(syllableTotalPages, syllablePage + 1))}
                disabled={syllablePage === syllableTotalPages}
                className="px-4 py-2 bg-purple-200 dark:bg-purple-700 hover:bg-purple-300 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-purple-900 dark:text-purple-100"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && !searchResult && syllableResults.length === 0 && (
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
                <WordCard 
                  key={word.id} 
                  word={word}
                  onWordClick={openWordDetail}
                  onSyllableClick={handleSyllableClick}
                />
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

      {/* 单词详情模态框 */}
      {selectedWord && (
        <WordDetailModal 
          word={selectedWord} 
          onClose={closeWordDetail}
          onSyllableClick={handleSyllableClick}
        />
      )}
    </div>
  );
}

interface WordCardProps {
  word: Word;
  onWordClick: (word: Word) => void;
  onSyllableClick: (syllable: string) => void;
  highlightSyllable?: string;
}

function WordCard({ word, onWordClick, onSyllableClick, highlightSyllable }: WordCardProps) {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 
            className="text-xl font-bold text-zinc-900 dark:text-zinc-50 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => onWordClick(word)}
            title="点击查看完整信息"
          >
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
                onClick={() => onSyllableClick(syllable)}
                className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all ${
                  highlightSyllable === syllable
                    ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                }`}
                title="点击查询包含此音节的单词"
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

interface WordDetailModalProps {
  word: Word;
  onClose: () => void;
  onSyllableClick: (syllable: string) => void;
}

function WordDetailModal({ word, onClose, onSyllableClick }: WordDetailModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{word.word}</h2>
              {word.phonetic && (
                <p className="text-lg text-blue-100 mt-2">{word.phonetic}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              title="关闭"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 翻译 */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">翻译</h3>
            <p className="text-lg text-zinc-900 dark:text-zinc-100">{word.translation}</p>
          </div>

          {/* 音节 */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">音节</h3>
            <div className="flex flex-wrap gap-2">
              {word.syllables.map((syllable, idx) => (
                <span
                  key={idx}
                  onClick={() => {
                    onSyllableClick(syllable);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base font-medium cursor-pointer transition-colors"
                  title="点击查询包含此音节的单词"
                >
                  {syllable}
                </span>
              ))}
            </div>
          </div>

          {/* 自然拼读解析 */}
          {word.phonetic_analysis && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">📘 自然拼读解析</h3>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {word.phonetic_analysis}
                </p>
              </div>
            </div>
          )}

          {/* 词根词缀 */}
          {word.root_affix && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">🟧 词根词缀</h3>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {word.root_affix}
                </p>
              </div>
            </div>
          )}

          {/* 其他信息 */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">单词ID</h3>
              <p className="text-zinc-900 dark:text-zinc-100">{word.id}</p>
            </div>
            {word.query_count !== undefined && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">查询次数</h3>
                <p className="text-zinc-900 dark:text-zinc-100">{word.query_count} 次</p>
              </div>
            )}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">创建时间</h3>
              <p className="text-zinc-900 dark:text-zinc-100">
                {new Date(word.created_at).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-b-2xl border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
