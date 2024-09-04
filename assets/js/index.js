document.addEventListener('click', function() {
    const footer = document.querySelector('.footer');
    const wallpaper = document.querySelector('.wallpaper');

    if (footer.contains(event.target) || wallpaper.contains(event.target)) {
        window.location.href = '/main';
    }
});

var userLang = navigator.language || navigator.userLanguage; 
const storedLang = sessionStorage.getItem('language');
if (!storedLang) {
    sessionStorage.setItem('language', userLang);
}

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();
        const selectedLang = this.getAttribute('data-lang');
        sessionStorage.setItem('language', selectedLang);
        
        window.location.href = `/switch/${selectedLang}`;
    });
});