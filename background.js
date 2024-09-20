if (browser.action === undefined) {
    // Manifest V2
    var browserAction = browser.browserAction;
    var executeScript = (tabId, filePath) => browser.tabs.executeScript(tabId, {
        allFrames: true,
        file: filePath,
    });
} else {
    // Manifest V3
    var browserAction = browser.action;
    var executeScript = (tabId, filePath) => browser.scripting.executeScript({
        target: {
            tabId: tabId,
            allFrames: true,
        },
        files: [filePath],
    });
}

let isEnabled = false;

function notifyTab(tabId) {
    browser.tabs.sendMessage(tabId, isEnabled ? "start" : "stop").catch(() => { });
}

browserAction.onClicked.addListener((tab) => {
    isEnabled = !isEnabled;

    const iconPath = isEnabled ? "pin_128_128.png" : "pin_128_128_crossed.png";

    browserAction.setIcon({ path: iconPath });

    notifyTab(tab.id);
});

browser.runtime.onMessage.addListener((message, sender) => {
    if (message === "newTab") {
        notifyTab(sender.tab.id);
    }
});
