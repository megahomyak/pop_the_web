(async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const popAudioBuffer = await audioContext.decodeAudioData(
        await (
            await fetch(browser.runtime.getURL('pop.mp3'))
        ).arrayBuffer()
    );

    function handleClick(event) {
        const audioBufferSource = audioContext.createBufferSource();
        audioBufferSource.buffer = popAudioBuffer;
        audioBufferSource.connect(audioContext.destination);
        audioBufferSource.start();
        event.target.remove();
        event.preventDefault();
    }

    browser.runtime.onMessage.addListener((message) => {
        if (message === "start") {
            document.addEventListener("click", handleClick, { capture: true });
        } else if (message === "stop") {
            document.removeEventListener("click", handleClick, { capture: true });
        }
    });
})();
