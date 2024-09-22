(async () => {
    if (browser === undefined) {
        var browser = chrome;
    }
    const AudioContext = window.AudioContext// || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const popAudioBuffer = await audioContext.decodeAudioData(
        await (
            await fetch(browser.runtime.getURL('pop.mp3'))
        ).arrayBuffer()
    );

    let extension = {
        _isEnabled: null,
        _oldTouchAction: null,
        get isEnabled() { return this._isEnabled; },
        set isEnabled(newIsEnabled) {
            this._isEnabled = newIsEnabled;
            if (this._isEnabled) {
                this._oldTouchAction = document.documentElement.style["touch-action"];
                document.documentElement.style["touch-action"] = "manipulation";
            } else {
                document.documentElement.style["touch-action"] = this._oldTouchAction;
            }
        }
    };
    extension.isEnabled = await browser.runtime.sendMessage({ type: "getIsEnabled" });
    let selectedElement = null;

    function handlePointerEvent(event) {
        if (!extension.isEnabled) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        (async () => {
            if (event.type === "pointerup") {
                if (selectedElement !== document.documentElement) {
                    const audioBufferSource = audioContext.createBufferSource();
                    audioBufferSource.buffer = popAudioBuffer;
                    audioBufferSource.connect(audioContext.destination);
                    await audioContext.resume();
                    audioBufferSource.start();
                    selectedElement.remove();
                    console.log(audioContext, audioBufferSource);
                }
            } else if (event.type === "pointerdown") {
                event.target.style["touch-action"] = "manipulation";
                selectedElement = event.target;
            }
        })();
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
