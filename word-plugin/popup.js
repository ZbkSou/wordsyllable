// Popup 页面逻辑

// DOM 元素
let loginView, registerView, mainView;
let loginForm, registerForm, searchForm;
let loginError, registerError, errorMessage;
let wordDetail, emptyState, loading;
let userDisplay, logoutBtn;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 获取 DOM 元素
  loginView = document.getElementById('loginView');
  registerView = document.getElementById('registerView');
  mainView = document.getElementById('mainView');
  
  loginForm = document.getElementById('loginForm');
  registerForm = document.getElementById('registerForm');
  searchForm = document.getElementById('searchForm');
  
  loginError = document.getElementById('loginError');
  registerError = document.getElementById('registerError');
  errorMessage = document.getElementById('errorMessage');
  
  wordDetail = document.getElementById('wordDetail');
  emptyState = document.getElementById('emptyState');
  loading = document.getElementById('loading');
  
  userDisplay = document.getElementById('userDisplay');
  logoutBtn = document.getElementById('logoutBtn');

  // 绑定事件
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  searchForm.addEventListener('submit', handleSearch);
  
  document.getElementById('showRegisterBtn').addEventListener('click', showRegisterView);
  document.getElementById('backToLoginBtn').addEventListener('click', showLoginView);
  logoutBtn.addEventListener('click', handleLogout);

  // 加载认证信息并初始化
  await init();
});

// 初始化
async function init() {
  try {
    const auth = await wordAPI.loadAuth();
    
    if (auth.token && auth.user) {
      // 已登录，显示主界面
      showMainView(auth.user);
      
      // 检查是否有待查询的单词
      checkPendingWord();
    } else {
      // 未登录，显示登录界面
      showLoginView();
      
      // 加载保存的 API 地址
      if (auth.apiUrl) {
        document.getElementById('apiUrl').value = auth.apiUrl;
      }
    }
  } catch (error) {
    console.error('初始化失败:', error);
    showLoginView();
  }
}

// 检查是否有待查询的单词
async function checkPendingWord() {
  try {
    const result = await chrome.storage.local.get(['pendingWord']);
    if (result.pendingWord) {
      // 有待查询的单词，立即查询
      await lookupWord(result.pendingWord);
      // 清除待查询的单词
      await chrome.storage.local.remove(['pendingWord']);
    }
  } catch (error) {
    console.error('检查待查询单词失败:', error);
  }
}

// 显示登录界面
function showLoginView() {
  loginView.style.display = 'block';
  registerView.style.display = 'none';
  mainView.style.display = 'none';
  clearError(loginError);
}

// 显示注册界面
function showRegisterView() {
  loginView.style.display = 'none';
  registerView.style.display = 'block';
  mainView.style.display = 'none';
  clearError(registerError);
}

// 显示主界面
function showMainView(user) {
  loginView.style.display = 'none';
  registerView.style.display = 'none';
  mainView.style.display = 'block';
  
  // 显示用户信息
  userDisplay.textContent = `👤 ${user.username}`;
  
  // 显示空状态
  showEmptyState();
}

// 处理登录
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const apiUrl = document.getElementById('apiUrl').value.trim();
  
  if (!username || !password) {
    showError(loginError, '请输入用户名和密码');
    return;
  }
  
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.disabled = true;
  loginBtn.textContent = '登录中...';
  clearError(loginError);
  
  try {
    // 设置 API 地址
    wordAPI.setBaseUrl(apiUrl);
    
    // 登录
    const data = await wordAPI.login(username, password);
    
    // 显示主界面
    showMainView(data.user);
  } catch (error) {
    console.error('登录失败:', error);
    showError(loginError, error.message || '登录失败，请检查用户名和密码');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = '登录';
  }
}

// 处理注册
async function handleRegister(e) {
  e.preventDefault();
  
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  
  if (!username || !email || !password) {
    showError(registerError, '请填写所有字段');
    return;
  }
  
  const registerBtn = document.getElementById('registerBtn');
  registerBtn.disabled = true;
  registerBtn.textContent = '注册中...';
  clearError(registerError);
  
  try {
    // 使用登录界面的 API 地址
    const apiUrl = document.getElementById('apiUrl').value.trim();
    wordAPI.setBaseUrl(apiUrl);
    
    // 注册
    const data = await wordAPI.register(username, email, password);
    
    // 显示主界面
    showMainView(data.user);
  } catch (error) {
    console.error('注册失败:', error);
    showError(registerError, error.message || '注册失败');
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = '注册';
  }
}

// 处理搜索
async function handleSearch(e) {
  e.preventDefault();
  
  const searchInput = document.getElementById('searchInput');
  const word = searchInput.value.trim();
  
  if (!word) {
    return;
  }
  
  await lookupWord(word);
}

// 查询单词
async function lookupWord(word) {
  showLoading();
  clearError(errorMessage);
  
  try {
    const data = await wordAPI.lookupWord(word);
    displayWordDetail(data);
  } catch (error) {
    console.error('查询失败:', error);
    hideLoading();
    showError(errorMessage, error.message || '查询失败，请稍后重试');
  }
}

// 显示单词详情
function displayWordDetail(data) {
  hideLoading();
  
  const word = data.word;
  
  // 显示单词详情区域
  wordDetail.style.display = 'block';
  emptyState.style.display = 'none';
  errorMessage.style.display = 'none';
  
  // 填充数据
  document.getElementById('wordText').textContent = word.word;
  document.getElementById('wordPhonetic').textContent = word.phonetic || '无';
  document.getElementById('wordTranslation').textContent = word.translation || '无';
  
  // 显示音节
  const syllablesContainer = document.getElementById('wordSyllables');
  syllablesContainer.innerHTML = '';
  if (word.syllables && word.syllables.length > 0) {
    word.syllables.forEach(syllable => {
      const span = document.createElement('span');
      span.className = 'syllable';
      span.textContent = syllable;
      syllablesContainer.appendChild(span);
    });
  } else {
    syllablesContainer.textContent = '无';
  }
  
  // 显示自然拼读解析（如果有）
  const phoneticAnalysisRow = document.getElementById('phoneticAnalysisRow');
  if (word.phonetic_analysis) {
    phoneticAnalysisRow.style.display = 'flex';
    document.getElementById('wordPhoneticAnalysis').textContent = word.phonetic_analysis;
  } else {
    phoneticAnalysisRow.style.display = 'none';
  }
  
  // 显示词根词缀（如果有）
  const rootAffixRow = document.getElementById('rootAffixRow');
  if (word.root_affix) {
    rootAffixRow.style.display = 'flex';
    document.getElementById('wordRootAffix').textContent = word.root_affix;
  } else {
    rootAffixRow.style.display = 'none';
  }
  
  // 显示操作标记
  const actionBadge = document.getElementById('wordAction');
  if (data.action === 'added') {
    actionBadge.textContent = '新添加';
    actionBadge.className = 'action-badge added';
  } else if (data.action === 'queried') {
    actionBadge.textContent = '已存在';
    actionBadge.className = 'action-badge queried';
  }
  
  // 显示查询次数（如果有）
  const queryCountRow = document.getElementById('queryCountRow');
  if (word.query_count !== undefined) {
    queryCountRow.style.display = 'flex';
    document.getElementById('wordQueryCount').textContent = word.query_count;
  } else {
    queryCountRow.style.display = 'none';
  }
}

// 显示加载状态
function showLoading() {
  loading.style.display = 'block';
  wordDetail.style.display = 'none';
  emptyState.style.display = 'none';
  errorMessage.style.display = 'none';
}

// 隐藏加载状态
function hideLoading() {
  loading.style.display = 'none';
}

// 显示空状态
function showEmptyState() {
  loading.style.display = 'none';
  wordDetail.style.display = 'none';
  emptyState.style.display = 'block';
  errorMessage.style.display = 'none';
}

// 显示错误信息
function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

// 清除错误信息
function clearError(element) {
  element.textContent = '';
  element.style.display = 'none';
}

// 处理退出登录
async function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    await wordAPI.clearAuth();
    showLoginView();
  }
}

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'wordLookedUp') {
    // 单词查询完成，显示结果
    if (message.success) {
      displayWordDetail(message.data);
    } else {
      showError(errorMessage, message.error || '查询失败');
    }
  }
});

