
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

document.addEventListener('DOMContentLoaded', () => {
    const muteButton = document.getElementById('muteButton');
    let isMuted = sessionStorage.getItem('mute') === 'true';
    
    const icon = muteButton.querySelector('i');
    if (isMuted) {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    } else {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    }

    muteButton.addEventListener('click', () => {
        stopSpeak();
        isMuted = !isMuted;
        if (isMuted) {
            icon.classList.remove('fa-volume-up');
            icon.classList.add('fa-volume-mute');
        } else {
            icon.classList.remove('fa-volume-mute');
            icon.classList.add('fa-volume-up');
        }
        sessionStorage.setItem('mute', isMuted);
    });
});
