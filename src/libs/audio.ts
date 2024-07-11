
export const deferredPlay = (ap:HTMLAudioElement) => {
    ap.addEventListener('loadeddata', () => {
        ap.play().catch(error => {
            // Handle potential errors during playback (e.g., user gesture required)
            console.error("Error playing audio:", error);
        });
    });
}

export function fadeIn(audio: HTMLAudioElement, duration:number) {
    audio.volume = 0;
    audio.play();

    const step = 0.1 / (duration / 100);
    let volume = 0;

    const fadeAudioIn = setInterval(() => {
        volume += step;
        if (volume >= 1) {
            audio.volume = 1;
            clearInterval(fadeAudioIn);
        } else {
            audio.volume = volume;
        }
    }, 10);
    return fadeAudioIn;
}