(async () => {
    if (browser === undefined) {
        var browser = chrome;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const popAudioBuffer = await audioContext.decodeAudioData(
        await (
            await fetch(browser.runtime.getURL('pop.mp3'))
        ).arrayBuffer()
    );

    class IsEnabled {
        #value;
        #oldTouchAction = null;
        constructor(initialValue) {
            this.#value = initialValue;
        }
        set(newValue) {
            this.#value = newValue;
            if (this.#value) {
                this.#oldTouchAction = document.documentElement.style["touch-action"];
                document.documentElement.style["touch-action"] = "none";
            } else {
                document.documentElement.style["touch-action"] = this.#oldTouchAction;
            }
        }
        get() {
            return this.#value;
        }
    }
    let isEnabled = new IsEnabled(await browser.runtime.sendMessage({ type: "getIsEnabled" }));

    function handleEvent(event) {
        if (!isEnabled.get()) {
            return;
        }
        console.log(event.type, document.documentElement.style.touchAction);
        if (event.type === "click" && event.target.remove !== undefined) {
            const audioBufferSource = audioContext.createBufferSource();
            audioBufferSource.buffer = popAudioBuffer;
            audioBufferSource.connect(audioContext.destination);
            audioBufferSource.start();
            event.target.remove();
        }
        if (event.type !== "pointerdown") {
        }
        event.stopImmediatePropagation();
    }

    `
    pointerover pointerenter pointerdown pointermove pointerup pointercancel pointerout pointerleave pointerrawupdate gotpointercapture lostpointercapture
    auxclick click contextmenu dblclick DOMActivate mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup webkitmouseforcechanged webkitmouseforcedown webkitmouseforcewillbegin webkitmouseforceup
    gesturechange gestureend gesturestart touchcancel touchend touchmove touchstart
    `.split(/\s+/).forEach(eventName => {
        document.addEventListener(eventName, handleEvent, { capture: true });
    });

    browser.runtime.onMessage.addListener(message => {
        if (message.type === "setIsEnabled") {
            isEnabled.set(message.value);
        }
    });
})();
