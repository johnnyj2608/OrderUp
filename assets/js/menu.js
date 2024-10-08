document.getElementById('backButton').addEventListener('click', async () => {
    window.location.href = '/main';
});

function handleMealClick(menuType, menuItem) {
    const panel = document.getElementById(`btn-${menuItem}`);
    let scroll = true;

    const selectedMenu = `selected${menuType}`;
    if (panel.classList.contains(selectedMenu)) {
        panel.classList.remove(selectedMenu);
        scroll = false;
    } else {
        document.querySelectorAll('.panel').forEach(btn => {
            btn.classList.remove(selectedMenu);
        });
        panel.classList.add(selectedMenu);
    }
    updateSubmitButtonState(scroll);
}

function updateSubmitButtonState(scroll) {
    const isBreakfastSelected = document.querySelector('.selectedBreakfast') !== null;
    const isLunchSelected = document.querySelector('.selectedLunch') !== null;

    if (scroll) {
        if (!isBreakfastSelected && isLunchSelected) {
            document.getElementById('breakfast-section').scrollIntoView({ behavior: 'smooth' });
        } else if (isBreakfastSelected && !isLunchSelected) {
            document.getElementById('lunch-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (isBreakfastSelected && isLunchSelected) {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}

document.getElementById('submitButton').addEventListener('click', async function() {
    if (!this.classList.contains('disabled')) {
        this.classList.add('disabled');
        const messageElement = document.getElementById('confirmationMessage');
        const staticMessage = messageElement.getAttribute('data-static-msg');
        const clickMessage = messageElement.getAttribute('data-click-msg');
    
        function updateMessage(countdown) {
            const countdownMessage = messageElement.getAttribute('data-countdown');
            messageElement.innerHTML = staticMessage+'<br>'+clickMessage+'<br><br>'+countdownMessage.replace('{{seconds}}', countdown);
        }    

        const breakfastID = (document.querySelector('.selectedBreakfast')?.getAttribute('data-order')) || 'none';
        const lunchID = (document.querySelector('.selectedLunch')?.getAttribute('data-order')) || 'none';

        const breakfastName = (document.querySelector('.selectedBreakfast')?.getAttribute('data-text')) || 'none';
        const lunchName = (document.querySelector('.selectedLunch')?.getAttribute('data-text')) || 'none';

        const name = sessionStorage.getItem('name');
        const insurance = sessionStorage.getItem('insurance');
        const rowNumber = sessionStorage.getItem('rowNumber');
        const weekday = sessionStorage.getItem('weekday');

        try {
            const response = await fetch('/submitOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name,
                    insurance,
                    rowNumber,
                    breakfastID, 
                    breakfastName, 
                    lunchID, 
                    lunchName,
                    deviceType: isMobileDevice() ? 'Mobile' : 'Desktop', 
                    weekday,}),
            });

            const result = await response.json();
            if (result.success) {
                const overlay = document.getElementById('confirmationOverlay');
                overlay.classList.add('show');

                speakText(staticMessage);

                let countdown = 5;
                updateMessage(countdown);
                const interval = setInterval(() => {
                    if (countdown > 0) {
                        countdown--;
                        updateMessage(countdown);
                    } else {
                        clearInterval(interval);
                        window.location.href = '/';
                    }
                }, 1000);

                overlay.addEventListener('click', () => {
                    clearInterval(interval);
                    window.location.href = '/';
                    stopSpeak();
                });
            } else {
                const overlay = document.getElementById('errorOverlay');
                const errorMessageElement = document.getElementById('errorMessage');

                overlay.classList.add('show');
                errorMessageElement.innerHTML = result.message+'<br><br>'+clickMessage;
                speakText(result.message);

                overlay.addEventListener('click', () => {
                    overlay.classList.remove('show');
                    stopSpeak();
                    this.classList.remove('disabled');
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

window.onload = function() {
    speakText(document.getElementById('nameUnits').innerText);
};