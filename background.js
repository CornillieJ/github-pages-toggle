browser.browserAction.onClicked.addListener((tab) => {
  const destination = getTogglePagesUrl(tab.url);
  if (destination) {
    browser.tabs.update(tab.id, { url: destination });
  }
});
