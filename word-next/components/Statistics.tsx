'use client';

import { useState, useEffect } from 'react';
import { statsAPI, StatsOverview, WordStat, SyllableStat } from '@/utils/api';

export default function Statistics() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [wordStats, setWordStats] = useState<WordStat[]>([]);
  const [syllableStats, setSyllableStats] = useState<SyllableStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'words' | 'syllables'>('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [overviewRes, wordStatsRes, syllableStatsRes] = await Promise.all([
        statsAPI.getOverview(),
        statsAPI.getWordStats(10),
        statsAPI.getSyllableStats(10),
      ]);
      setOverview(overviewRes.data.overview);
      setWordStats(wordStatsRes.data.stats);
      setSyllableStats(syllableStatsRes.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
        <div className="text-center py-8 text-zinc-500">加载统计数据中...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">统计数据</h2>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors text-sm"
          >
            刷新
          </button>
        </div>

        {/* Tab切换 */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('words')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'words'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            单词统计
          </button>
          <button
            onClick={() => setActiveTab('syllables')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'syllables'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            音节统计
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'overview' && overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              title="单词查询总次数"
              value={overview.total_word_queries}
              icon="📊"
            />
            <StatCard
              title="查询过的单词数"
              value={overview.unique_words_queried}
              icon="📖"
            />
            <StatCard
              title="音节查询总次数"
              value={overview.total_syllable_queries}
              icon="🔤"
            />
            <StatCard
              title="查询过的音节数"
              value={overview.unique_syllables_queried}
              icon="🎵"
            />
            <StatCard
              title="系统总单词数"
              value={overview.total_words_in_system}
              icon="📚"
            />
            <StatCard
              title="系统总音节数"
              value={overview.total_syllables_in_system}
              icon="🔠"
            />
          </div>
        )}

        {activeTab === 'words' && (
          <div className="space-y-3">
            {wordStats.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">暂无单词查询记录</div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                  查询次数最多的单词（前10）
                </h3>
                {wordStats.map((stat, idx) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-600 w-8">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {stat.word}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          最后查询：{new Date(stat.last_queried_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {stat.query_count} 次
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'syllables' && (
          <div className="space-y-3">
            {syllableStats.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">暂无音节查询记录</div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                  查询次数最多的音节（前10）
                </h3>
                {syllableStats.map((stat, idx) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-600 w-8">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {stat.syllable}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          最后查询：{new Date(stat.last_queried_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {stat.query_count} 次
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
    </div>
  );
}

