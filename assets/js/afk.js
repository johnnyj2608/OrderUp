document.addEventListener('DOMContentLoaded', function() {
    let timeout;
    let interval;
    const errorOverlay = document.getElementById('errorOverlay');
    const afkOverlay = document.getElementById('afkOverlay');
    const messageElement = document.getElementById('afkMessage');
    const staticMessage = messageElement.getAttribute('data-static-msg')
    const clickMessage = messageElement.getAttribute('data-click-msg')

    function updateMessage(countdown) {
        const countdownMessage = messageElement.getAttribute('data-countdown');
        messageElement.innerHTML = staticMessage+'<br>'+clickMessage+'<br><br>'+countdownMessage.replace('{{seconds}}', countdown);
    }

    function inactivityOverlay() {
        speakText(staticMessage);
        let countdown = 10;
        errorOverlay.classList.remove('show');
        updateMessage(countdown);
        interval = setInterval(() => {
            if (countdown > 0) {
                countdown--;
                updateMessage(countdown);
            } else {
                clearInterval(interval);
                window.location.href = '/';
            }
        }, 1000);
    }

    function startTimeout() {
        if (!isMobileDevice()) {
            timeout = setTimeout(() => {
                afkOverlay.classList.add('show');
                inactivityOverlay();
            }, 15000); // 15 seconds
        }
    }

    function resetTimeout() {
        clearTimeout(timeout);
        clearInterval(interval);
        updateMessage(10);
        afkOverlay.classList.remove('show');
        startTimeout();
    }

    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keydown', resetTimeout);
    document.addEventListener('click', resetTimeout);
    document.addEventListener('scroll', resetTimeout);
    document.addEventListener('touchstart', resetTimeout);

    startTimeout(); 
});
