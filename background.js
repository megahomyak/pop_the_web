if (browser.action === undefined) {
    // Manifest V2
    var browserAction = browser.browserAction;
} else {
    // Manifest V3
    var browserAction = browser.action;
}

let isEnabled = false;

browserAction.onClicked.addListener(() => {
    isEnabled = !isEnabled;

    const iconPath = isEnabled ? "pin_128_128.png" : "pin_128_128_crossed.png";

    browserAction.setIcon({ path: iconPath });

    browser.tabs.query({}).then((tabs) => {
        for (const tab of tabs) {
            browser.tabs.sendMessage(tab.id, { type: "setIsEnabled", value: isEnabled });
        }
    });
});

browser.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message.type === "getIsEnabled") {
        respond(isEnabled);
    }
});
