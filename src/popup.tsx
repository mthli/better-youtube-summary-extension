import browser from 'webextension-polyfill'

// Simply jump to options page.
browser.tabs
  .create({ url: browser.runtime.getURL('options.html') })
  .finally(() => window.close())
