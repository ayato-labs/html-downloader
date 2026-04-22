let lastDownloadId = null;

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  const openFolderBtn = document.getElementById('openFolderBtn');
  const format = document.querySelector('input[name="format"]:checked').value;
  
  statusDiv.textContent = "準備中...";
  openFolderBtn.style.display = 'none';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      statusDiv.textContent = "タブが見つかりません。";
      return;
    }

    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      statusDiv.textContent = "このページ（システムページ）は保存できません。";
      return;
    }

    let blob;
    let extension;
    let safeTitle = (tab.title || "downloaded_page").replace(/[\\/:*?"<>|]/g, '_');

    if (format === 'mhtml') {
      // ページ全体 (MHTML) を保存
      statusDiv.textContent = "ページをキャプチャ中...";
      blob = await chrome.pageCapture.saveAsMHTML({ tabId: tab.id });
      extension = 'mhtml';
    } else {
      // HTMLのみを保存
      statusDiv.textContent = "HTMLを取得中...";
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          html: document.documentElement.outerHTML,
          title: document.title
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
          saveAs: false
        });
        statusDiv.textContent = "ダウンロード完了！";
        openFolderBtn.style.display = 'block';
      } catch (downloadErr) {
        statusDiv.textContent = "ダウンロードエラー: " + downloadErr.message;
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    }
  } catch (err) {
    statusDiv.textContent = "エラーが発生しました: " + err.message;
    console.error(err);
  }
});

document.getElementById('openFolderBtn').addEventListener('click', () => {
  if (lastDownloadId !== null) {
    chrome.downloads.show(lastDownloadId);
  }
});
