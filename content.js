(async () => {
    if (browser === undefined) {
        var browser = chrome;
    }
    const AudioContext = window.AudioContext//|| window.webkitAudioContext;
    const audioContext = new AudioContext();
    const popAudioBuffer = await audioContext.decodeAudioData(
        await (
            await fetch(browser.runtime.getURL('pop.mp3'))
        ).arrayBuffer()
    );

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
            const selectedElement = selectedElements.get(event.pointerId);
            selectedElements.delete(event.pointerId);
            if (selectedElement !== document.documentElement) {
                selectedElement.remove();
                audioContext.resume().then(() => {
                    const audioBufferSource = audioContext.createBufferSource();
                    audioBufferSource.buffer = popAudioBuffer;
                    audioBufferSource.connect(audioContext.destination);
                    audioBufferSource.start();
                });
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
