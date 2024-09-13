function speakText(text) {
    const mute = sessionStorage.getItem('mute') === 'true';
    if (mute) {
        return;
    }
    stopSpeak();
    const utterance = new SpeechSynthesisUtterance(text);
    const language = sessionStorage.getItem('language');

    let localeSuffix = '';
    if (language === 'zh') {
        localeSuffix = '-CN';
    } else if (language === 'en') {
        localeSuffix = '-US';
    }

    utterance.lang = language + localeSuffix;
    speechSynthesis.speak(utterance);
}

function stopSpeak() {
    speechSynthesis.cancel();
}