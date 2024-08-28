document.addEventListener('DOMContentLoaded', function() {
    let timeout;
    let interval;
    const errorOverlay = document.getElementById('errorOverlay');
    const afkOverlay = document.getElementById('afkOverlay');
    const messageElement = document.getElementById('afkMessage');

    function inactivityOverlay() {
        let countdown = 9;
        errorOverlay.classList.remove('show');
        interval = setInterval(() => {
            if (countdown > 0) {
                messageElement.innerHTML = `Prolonged inactivity! 
                Redirecting in ${countdown} seconds...`;
                countdown--;
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
        }, 15000); 
    }

    function resetTimeout() {
        clearTimeout(timeout);
        clearInterval(interval);
        messageElement.innerHTML = `Prolonged inactivity! 
                Redirecting in 10 seconds...`;
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
