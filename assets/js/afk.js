document.addEventListener('DOMContentLoaded', function() {
    let timeout;

    function startTimeout() {
        timeout = setTimeout(() => {
            window.location.href = '/';
        }, 15000);
    }

    function resetTimeout() {
        clearTimeout(timeout);
        startTimeout();
    }

    startTimeout();

    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keydown', resetTimeout);
    document.addEventListener('click', resetTimeout);
    document.addEventListener('scroll', resetTimeout);
    document.addEventListener('touchstart', resetTimeout);
});
