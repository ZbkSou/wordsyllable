// Content Script - 在网页中运行的脚本

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSelectedText') {
    // 获取当前选中的文本
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
  }
});

// 可以在这里添加其他与网页交互的功能
// 例如：添加快捷键支持等

console.log('单词记忆助手 Content Script 已加载');


