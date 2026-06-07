import { convertToMarkdown } from './converter.js';

let lastDownloadId = null;

const handleDownload = async () => {
  const statusDiv = document.getElementById('status');
  const openFolderBtn = document.getElementById('openFolderBtn');
  const format = document.querySelector('input[name="format"]:checked').value;

  statusDiv.textContent = '準備中...';
  openFolderBtn.style.display = 'none';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      statusDiv.textContent = 'タブが見つかりません。';
      return;
    }

    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      statusDiv.textContent = 'このページ（システムページ）は保存できません。';
      return;
    }

    let blob;
    let extension;
    let safeTitle = (tab.title || 'downloaded_page').replace(/[\\/:*?"<>|]/g, '_');

    if (format === 'mhtml') {
      // ページ全体 (MHTML) を保存
      statusDiv.textContent = 'ページをキャプチャ中...';
      blob = await chrome.pageCapture.saveAsMHTML({ tabId: tab.id });
      extension = 'mhtml';
    } else if (format === 'markdown') {
      // Markdownとして保存
      statusDiv.textContent = 'Markdownに変換中...';

      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const walk = (node) => {
            if (node.nodeType === 3) return node.nodeValue.trim();
            if (node.nodeType !== 1) return '';
            const tag = node.tagName.toLowerCase();
            if (['script', 'style', 'nav', 'footer', 'header', 'noscript'].includes(tag)) return '';
            let parts = [];
            for (let child of node.childNodes) {
              const res = walk(child);
              if (res) parts.push(res);
            }
            const isBlock = [
              'div',
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'li',
              'article',
              'section',
              'main',
            ].includes(tag);
            let md = parts.join(isBlock ? ' ' : '');
            if (!md && tag !== 'br') return '';
            switch (tag) {
              case 'h1':
                return `\n# ${md}\n\n`;
              case 'h2':
                return `\n## ${md}\n\n`;
              case 'h3':
                return `\n### ${md}\n\n`;
              case 'h4':
                return `\n#### ${md}\n\n`;
              case 'h5':
                return `\n##### ${md}\n\n`;
              case 'h6':
                return `\n###### ${md}\n\n`;
              case 'p':
                return `\n${md}\n\n`;
              case 'li':
                return `- ${md}\n`;
              case 'br':
                return '\n';
              case 'strong':
              case 'b':
                return `**${md}**`;
              case 'em':
              case 'i':
                return `*${md}*`;
              case 'a': {
                const href = node.getAttribute('href');
                return href && href.startsWith('http') ? `[${md}](${href})` : md;
              }
              default:
                return isBlock ? `\n${md}\n` : md;
            }
          };
          const container =
            document.querySelector('article') || document.querySelector('main') || document.body;
          return {
            markdown: walk(container)
              .replace(/\n\s+\n/g, '\n\n')
              .replace(/\n{3,}/g, '\n\n')
              .trim(),
            title: document.title,
          };
        },
      });

      if (injectionResults && injectionResults[0]) {
        const { markdown, title } = injectionResults[0].result;
        if (title) safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');
        blob = new Blob([markdown], { type: 'text/markdown' });
      }
      extension = 'md';
    } else {
      // HTMLのみを保存
      statusDiv.textContent = 'HTMLを取得中...';
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          html: document.documentElement.outerHTML,
          title: document.title,
        }),
      });

      if (injectionResults && injectionResults[0]) {
        const { html, title } = injectionResults[0].result;
        if (title) safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');
        blob = new Blob([html], { type: 'text/html' });
      }
      extension = 'html';
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      try {
        lastDownloadId = await chrome.downloads.download({
          url: url,
          filename: `${safeTitle}.${extension}`,
          saveAs: false,
        });
        statusDiv.textContent = 'ダウンロード完了！';
        openFolderBtn.style.display = 'block';
      } catch (downloadErr) {
        statusDiv.textContent = 'ダウンロードエラー: ' + downloadErr.message;
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    }
  } catch (err) {
    statusDiv.textContent = 'エラーが発生しました: ' + err.message;
    console.error(err);
  }
};

document.getElementById('downloadBtn').addEventListener('click', handleDownload);

document.getElementById('openFolderBtn').addEventListener('click', () => {
  if (lastDownloadId !== null) {
    chrome.downloads.show(lastDownloadId);
  }
});

// Avoid unused import error in popup.js if it's only for testing but we want to keep it
// Actually, popup.js is loaded in popup.html, and we use converter.js in tests.
// The import at the top might be flagged if not used here.
// But the user might want to keep it for consistency.
console.log('Converter loaded:', typeof convertToMarkdown);
