(async () => {
    if (browser === undefined) {
        var browser = chrome;
    }
    const pop = new Audio(browser.runtime.getURL('pop.mp3'));
    pop.load();

    let selectedElements = new Map();
    let extension = {
        _isEnabled: null,
        _oldDocumentElementStyle: null,
        get isEnabled() { return this._isEnabled; },
        set isEnabled(newIsEnabled) {
            this._isEnabled = newIsEnabled;
            if (this._isEnabled) {
                this._oldDocumentElementStyle = document.documentElement.style;
                document.documentElement.style["touch-action"] = "manipulation";
                document.documentElement.style.height = "100%";
            } else if (this._oldDocumentElementStyle !== null) {
                selectedElements.clear();
                document.documentElement.style = this._oldDocumentElementStyle;
            }
        }
    };
    extension.isEnabled = await browser.runtime.sendMessage({ type: "getIsEnabled" });

    function handlePointerEvent(event) {
        if (!extension.isEnabled) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.type === "pointerup") {
            let selectedElement = selectedElements.get(event.pointerId);
            if (selectedElement !== document.documentElement) {
                let popClone = pop.cloneNode();
                popClone.play();
                popClone.addEventListener("ended", () => {
                    popClone.remove();
                }, { once: true });
                selectedElement.remove();
            }
        } else if (event.type === "pointercancel") {
            selectedElements.delete(event.pointerId);
        } else if (event.type === "pointerdown") {
            event.target.style["touch-action"] = "manipulation";
            selectedElements.set(event.pointerId, event.target);
        }
    }

    `
    pointerover pointerenter pointerdown pointermove pointerup pointercancel pointerout pointerleave pointerrawupdate gotpointercapture lostpointercapture
    auxclick click contextmenu dblclick DOMActivate mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup webkitmouseforcechanged webkitmouseforcedown webkitmouseforcewillbegin webkitmouseforceup
    gesturechange gestureend gesturestart touchcancel touchend touchmove touchstart
    `.split(/\s+/).forEach(eventName => {
        document.addEventListener(eventName, handlePointerEvent, { capture: true });
    });

    browser.runtime.onMessage.addListener(message => {
        if (message.type === "setIsEnabled") {
            extension.isEnabled = message.value;
        }
    });
})();
