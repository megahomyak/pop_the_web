if (browser === undefined) {
    // Chrome, manifest v3
    var browser = chrome;
    var browserAction = browser.action;
    browser.tabs.query({}).then(tabs => {
        for (const tab of tabs) {
            browser.scripting.executeScript({
                target: {
                    tabId: tab.id,
                    allFrames: true,
                },
                files: ["content.js"]
            }).catch(() => {});
        }
    });
} else {
    // Firefox, manifest v2
    var browserAction = browser.browserAction;
}

let extension = {
    _isEnabled: false,
    get isEnabled() {
        return this._isEnabled;
    },
    set isEnabled(newIsEnabled) {
        this._isEnabled = newIsEnabled;
        const iconPath = this._isEnabled ? "pin_128_128.png" : "pin_128_128_crossed.png";
        browserAction.setIcon({ path: iconPath });
        browser.tabs.query({}).then(tabs => {
            for (const tab of tabs) {
                browser.tabs.sendMessage(tab.id, { type: "setIsEnabled", value: this._isEnabled }).catch(() => {});
            }
        });
    }
};

browserAction.onClicked.addListener(() => {
    extension.isEnabled = !extension.isEnabled;
});

browser.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message.type === "getIsEnabled") {
        respond(extension.isEnabled);
    }
});

window.addEventListener("beforeunload", () => {
    console.log("blah");
    extension.isEnabled = false;
});
