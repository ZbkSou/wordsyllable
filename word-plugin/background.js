// 后台脚本 - 处理右键菜单和消息传递

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addWordToMemory',
    title: '添加单词到记忆工具',
    contexts: ['selection']
  });
  
  console.log('单词记忆助手已安装');
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'addWordToMemory') {
    const selectedText = info.selectionText.trim();
    
    // 提取英文单词（移除标点符号）
    const word = selectedText.replace(/[^\w\s]/g, '').toLowerCase().trim();
    
    if (!word) {
      console.error('未选择有效的单词');
      return;
    }
    
    console.log('查询单词:', word);
    
    // 检查用户是否已登录
    chrome.storage.local.get(['token', 'user', 'apiUrl'], async (result) => {
      if (!result.token) {
        // 未登录，保存单词并打开 popup
        await chrome.storage.local.set({ pendingWord: word });
        chrome.action.openPopup();
        return;
      }
      
      // 已登录，直接查询
      try {
        const apiUrl = result.apiUrl || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/words/lookup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.token}`
          },
          body: JSON.stringify({ word })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '查询失败');
        }
        
        console.log('查询成功:', data);
        
        // 保存待显示的单词并打开 popup
        await chrome.storage.local.set({ pendingWord: word });
        
        // 通知 popup 显示结果
        chrome.runtime.sendMessage({
          action: 'wordLookedUp',
          success: true,
          data: data
        });
        
        // 显示通知
        showNotification(
          '✅ 单词查询成功',
          `${data.word.word}: ${data.word.translation}\n${data.action === 'added' ? '已添加到词库' : '词库中已存在'}`
        );
        
      } catch (error) {
        console.error('查询失败:', error);
        
        // 保存单词并打开 popup
        await chrome.storage.local.set({ pendingWord: word });
        
        // 通知 popup 显示错误
        chrome.runtime.sendMessage({
          action: 'wordLookedUp',
          success: false,
          error: error.message
        });
        
        showNotification('❌ 查询失败', error.message);
      }
    });
  }
});

// 显示通知
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 2
  });
}

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'lookupWord') {
    // 从 content script 接收单词查询请求
    handleWordLookup(message.word);
  }
});

// 处理单词查询
async function handleWordLookup(word) {
  chrome.storage.local.get(['token', 'user', 'apiUrl'], async (result) => {
    if (!result.token) {
      // 未登录
      await chrome.storage.local.set({ pendingWord: word });
      chrome.action.openPopup();
      return;
    }
    
    try {
      const apiUrl = result.apiUrl || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/words/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`
        },
        body: JSON.stringify({ word })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '查询失败');
      }
      
      // 保存并打开 popup
      await chrome.storage.local.set({ pendingWord: word });
      chrome.action.openPopup();
      
    } catch (error) {
      console.error('查询失败:', error);
      await chrome.storage.local.set({ pendingWord: word });
      chrome.action.openPopup();
    }
  });
}


