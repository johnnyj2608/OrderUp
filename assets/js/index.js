document.addEventListener('click', function() {
    const footer = document.querySelector('.footer');
    const wallpaper = document.querySelector('.wallpaper');

    if (footer.contains(event.target) || wallpaper.contains(event.target)) {
        window.location.href = '/main';
    }
});

if (isMobileDevice()) {
    console.log('hi')
    window.location.href = '/main';
}