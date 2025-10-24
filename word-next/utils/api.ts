import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ===== 认证相关 =====

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export const authAPI = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get<{ user: User }>('/auth/me'),
};

// ===== 单词管理 =====

export interface Syllable {
  syllable: string;
}

export interface Word {
  id: number;
  word: string;
  translation: string;
  phonetic?: string;
  syllables: string[];
  created_at: string;
  query_count?: number;
}

export interface AddWordManual {
  word: string;
  syllables: string[];
  translation: string;
  phonetic?: string;
}

export interface AddWordAuto {
  word: string;
}

export interface WordResponse {
  message: string;
  word: Word;
}

export interface WordListResponse {
  words: Word[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface WordSearchResponse {
  word: Word;
}

export interface LookupWordRequest {
  word: string;
}

export interface LookupWordResponse {
  message: string;
  action: 'queried' | 'added';  // 'queried' 表示已存在, 'added' 表示新添加
  word: Word;
}

export const wordsAPI = {
  addWord: (data: AddWordManual | AddWordAuto) => api.post<WordResponse>('/words', data),
  getWords: (page = 1, per_page = 20) => 
    api.get<WordListResponse>('/words', { params: { page, per_page } }),
  searchWord: (word: string) => 
    api.get<WordSearchResponse>('/words/search', { params: { word } }),
  getWordById: (id: number) => api.get<{ word: Word }>(`/words/${id}`),
  lookupWord: (data: LookupWordRequest) => api.post<LookupWordResponse>('/words/lookup', data),
};

// ===== 统计相关 =====

export interface WordStat {
  id: number;
  user_id: number;
  word_id: number;
  word: string;
  query_count: number;
  last_queried_at: string;
}

export interface SyllableStat {
  id: number;
  user_id: number;
  syllable_id: number;
  syllable: string;
  query_count: number;
  last_queried_at: string;
}

export interface StatsOverview {
  total_word_queries: number;
  unique_words_queried: number;
  total_syllable_queries: number;
  unique_syllables_queried: number;
  total_words_in_system: number;
  total_syllables_in_system: number;
}

export const statsAPI = {
  getWordStats: (limit = 50) => 
    api.get<{ stats: WordStat[] }>('/stats/words', { params: { limit } }),
  getSyllableStats: (limit = 50) => 
    api.get<{ stats: SyllableStat[] }>('/stats/syllables', { params: { limit } }),
  getOverview: () => 
    api.get<{ overview: StatsOverview }>('/stats/overview'),
};

// ===== 健康检查 =====
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;

