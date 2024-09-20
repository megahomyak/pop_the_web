(async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const popAudioBuffer = await audioContext.decodeAudioData(
        await (
            await fetch(browser.runtime.getURL('pop.mp3'))
        ).arrayBuffer()
    );

    let isEnabled = await browser.runtime.sendMessage({ type: "getIsEnabled" });

    document.addEventListener("pointerdown", (event) => {
        if (isEnabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const audioBufferSource = audioContext.createBufferSource();
            audioBufferSource.buffer = popAudioBuffer;
            audioBufferSource.connect(audioContext.destination);
            audioBufferSource.start();
            if (event.target.remove) {
                event.target.remove();
            }
        }
    }, { capture: true });

    browser.runtime.onMessage.addListener((message) => {
        if (message.type === "setIsEnabled") {
            isEnabled = message.value;
        }
    });
})();
