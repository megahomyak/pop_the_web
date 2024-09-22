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
    let scrollingOccured = false;

    function handleEvent(event) {
        console.log(event.type);
        if (!isEnabled) {
            return;
        }
        if (event.type === "pointerup") {
            if (!scrollingOccured && event.target.remove !== undefined) {
                const audioBufferSource = audioContext.createBufferSource();
                audioBufferSource.buffer = popAudioBuffer;
                audioBufferSource.connect(audioContext.destination);
                audioBufferSource.start();
                event.target.remove();
            }
        } else if (event.type === "pointerdown") {
            scrollingOccured = false;
        } else if (event.type === "scroll") {
            scrollingOccured = true;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    `
    pointerover pointerenter pointerdown pointermove pointerup pointercancel pointerout pointerleave pointerrawupdate gotpointercapture lostpointercapture
    auxclick click contextmenu dblclick DOMActivate mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup webkitmouseforcechanged webkitmouseforcedown webkitmouseforcewillbegin webkitmouseforceup
    gesturechange gestureend gesturestart touchcancel touchend touchmove touchstart
    scroll
    `.split(/\s+/).forEach(eventName => {
        document.addEventListener(eventName, handleEvent, { capture: true });
    });

    browser.runtime.onMessage.addListener(message => {
        if (message.type === "setIsEnabled") {
            isEnabled = message.value;
        }
    });
})();
