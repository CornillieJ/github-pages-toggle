browser.browserAction.onClicked.addListener(async (tab) => {
  const destination = await togglePagesUrl(tab.url);
  if (destination) {
    browser.tabs.update(tab.id, { url: destination });
  }
});
