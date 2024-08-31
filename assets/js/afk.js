document.addEventListener('DOMContentLoaded', function() {
    let timeout;
    let interval;
    const errorOverlay = document.getElementById('errorOverlay');
    const afkOverlay = document.getElementById('afkOverlay');
    const messageElement = document.getElementById('afkMessage');

    function updateMessage(countdown) {
        const localizedMessage = messageElement.getAttribute('message');
        messageElement.innerHTML = localizedMessage.replace('{{seconds}}', countdown);
    }

    function inactivityOverlay() {
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
        timeout = setTimeout(() => {
            afkOverlay.classList.add('show');
            inactivityOverlay();
        }, 15000); // 15 seconds
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
