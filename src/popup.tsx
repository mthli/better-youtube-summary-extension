// Simply jump to options page.
chrome.tabs
  .create({ url: chrome.runtime.getURL('options.html') })
  .finally(() => window.close())
