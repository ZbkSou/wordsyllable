// API 服务模块
class WordAPI {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.token = null;
  }

  // 设置 API 地址
  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, ''); // 移除末尾的斜杠
  }

  // 设置 token
  setToken(token) {
    this.token = token;
  }

  // 获取请求头
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // 用户注册
  async register(username, email, password) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '注册失败');
    }

    // 保存 token
    if (data.access_token) {
      this.setToken(data.access_token);
      await this.saveAuth(data.access_token, data.user);
    }

    return data;
  }

  // 用户登录
  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '登录失败');
    }

    // 保存 token
    if (data.access_token) {
      this.setToken(data.access_token);
      await this.saveAuth(data.access_token, data.user);
    }

    return data;
  }

  // 获取当前用户信息
  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return await response.json();
  }

  // 智能查询单词（存在则查询，不存在则自动添加）
  async lookupWord(word) {
    const response = await fetch(`${this.baseUrl}/api/words/lookup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ word: word.toLowerCase().trim() })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '查询失败');
    }

    return data;
  }

  // 搜索单词
  async searchWord(word) {
    const response = await fetch(
      `${this.baseUrl}/api/words/search?word=${encodeURIComponent(word)}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('搜索失败');
    }

    return await response.json();
  }

  // 保存认证信息到 Chrome Storage
  async saveAuth(token, user) {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        token: token,
        user: user,
        apiUrl: this.baseUrl
      }, resolve);
    });
  }

  // 从 Chrome Storage 加载认证信息
  async loadAuth() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['token', 'user', 'apiUrl'], (result) => {
        if (result.token) {
          this.setToken(result.token);
        }
        if (result.apiUrl) {
          this.setBaseUrl(result.apiUrl);
        }
        resolve(result);
      });
    });
  }

  // 清除认证信息
  async clearAuth() {
    this.token = null;
    return new Promise((resolve) => {
      chrome.storage.local.remove(['token', 'user'], resolve);
    });
  }

  // 检查是否已登录
  isLoggedIn() {
    return !!this.token;
  }
}

// 创建全局实例
const wordAPI = new WordAPI();


