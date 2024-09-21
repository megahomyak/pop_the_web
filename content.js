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

    function stopEverything(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    document.addEventListener("pointerdown", (event) => {
        if (isEnabled) {
            stopEverything(event);
            if (event.target.remove !== undefined) {
                const audioBufferSource = audioContext.createBufferSource();
                audioBufferSource.buffer = popAudioBuffer;
                audioBufferSource.connect(audioContext.destination);
                audioBufferSource.start();
                event.target.remove();
            }
        }
    }, { capture: true });
    `
    pointerover pointerenter pointerdown pointermove pointerup pointercancel pointerout pointerleave pointerrawupdate gotpointercapture lostpointercapture
    auxclick click contextmenu dblclick DOMActivate mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup webkitmouseforcechanged webkitmouseforcedown webkitmouseforcewillbegin webkitmouseforceup
    gesturechange gestureend gesturestart touchcancel touchend touchmove touchstart
    `.split(/\s+/).forEach((eventName) => {
        document.addEventListener(eventName, (event) => {
            if (isEnabled) {
                stopEverything(event);
            }
        }, { capture: true });
    });

    browser.runtime.onMessage.addListener((message) => {
        if (message.type === "setIsEnabled") {
            isEnabled = message.value;
        }
    });
})();
