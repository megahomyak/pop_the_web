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
    let selectedElement = null;

    function handlePointerEvent(event) {
        console.log(event.type);
        if (!isEnabled) {
            return;
        }
        if (event.type === "pointerup") {
            if (selectedElement !== null && selectedElement.remove !== undefined) {
                const audioBufferSource = audioContext.createBufferSource();
                audioBufferSource.buffer = popAudioBuffer;
                audioBufferSource.connect(audioContext.destination);
                audioBufferSource.start();
                selectedElement.remove();
            }
        } else if (event.type === "pointerdown") {
            selectedElement = event.target;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    `
    pointerover pointerenter pointerdown pointermove pointerup pointercancel pointerout pointerleave pointerrawupdate gotpointercapture lostpointercapture
    auxclick click contextmenu dblclick DOMActivate mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup webkitmouseforcechanged webkitmouseforcedown webkitmouseforcewillbegin webkitmouseforceup
    gesturechange gestureend gesturestart touchcancel touchend touchmove touchstart
    `.split(/\s+/).forEach(eventName => {
        document.addEventListener(eventName, handlePointerEvent, { capture: true });
    });

    document.addEventListener("scroll", () => {
        selectedElement = null;
    });

    browser.runtime.onMessage.addListener(message => {
        if (message.type === "setIsEnabled") {
            isEnabled = message.value;
        }
    });
})();
