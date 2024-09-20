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

function forEveryTabSilent(callback) {
    browser.tabs.query({}).then((tabs) => {
        for (const tab of tabs) {
            callback(tab).catch(() => {});
        }
    });
}

browserAction.onClicked.addListener(() => {
    isEnabled = !isEnabled;

    const iconPath = isEnabled ? "pin_128_128.png" : "pin_128_128_crossed.png";

    browserAction.setIcon({ path: iconPath });

    if (isEnabled) {
        forEveryTabSilent(async (tab) => {
            await browser.tabs.sendMessage(tab.id, "start");
        });
    } else {
        forEveryTabSilent(async (tab) => {
            await browser.tabs.sendMessage(tab.id, "stop");
        });
    }
});
