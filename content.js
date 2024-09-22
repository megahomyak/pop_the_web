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

    let isEnabled = await browser.runtime.sendMessage({ type: "getIsEnabled" });

    function handleEvent(event) {
        console.log(event, document.documentElement.style.touchAction);
        if (event.type === "click" && event.target.remove !== undefined) {
            const audioBufferSource = audioContext.createBufferSource();
            audioBufferSource.buffer = popAudioBuffer;
            audioBufferSource.connect(audioContext.destination);
            audioBufferSource.start();
            event.target.remove();
        }
        if (event.type !== "pointerdown") {
            event.preventDefault();
        }
        event.stopImmediatePropagation();
    }
    function getHandlerAdditionArguments(eventName) {
        return [eventName, handleEvent, { capture: true }];
    }

    let oldTouchAction = null;
    function updatePopping() {
        if (false) {
            oldTouchAction = document.documentElement.style.touchAction;
            document.documentElement.style.touchAction = "manipulation";
        } else {
            document.documentElement.style.touchAction = oldTouchAction;
        }
        `
        pointerover pointerenter pointerdown pointermove pointerup pointercancel pointerout pointerleave pointerrawupdate gotpointercapture lostpointercapture
        auxclick click contextmenu dblclick DOMActivate mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup webkitmouseforcechanged webkitmouseforcedown webkitmouseforcewillbegin webkitmouseforceup
        gesturechange gestureend gesturestart touchcancel touchend touchmove touchstart
        `.split(/\s+/).forEach(eventName => {
            document.removeEventListener(...getHandlerAdditionArguments(eventName));
            if (isEnabled) {
                document.addEventListener(...getHandlerAdditionArguments(eventName));
            }
        });
    }

    updatePopping();

    browser.runtime.onMessage.addListener(message => {
        if (message.type === "setIsEnabled") {
            isEnabled = message.value;
            updatePopping();
        }
    });
})();
