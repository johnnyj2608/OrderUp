document.addEventListener('DOMContentLoaded', function() {
    let timeout;
    let interval;
    const overlay = document.getElementById('afkOverlay');
    const messageElement = document.getElementById('afkMessage');

    function inactivityOverlay() {
        let countdown = 9;
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
            overlay.classList.add('show');
            inactivityOverlay();
        }, 15000); 
    }

    function resetTimeout() {
        clearTimeout(timeout);
        clearInterval(interval);
        messageElement.innerHTML = `Prolonged inactivity! 
                Redirecting in 10 seconds...`;
        overlay.classList.remove('show'); 
        startTimeout();
    }

    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keydown', resetTimeout);
    document.addEventListener('click', resetTimeout);
    document.addEventListener('scroll', resetTimeout);
    document.addEventListener('touchstart', resetTimeout);

    startTimeout(); 
});
