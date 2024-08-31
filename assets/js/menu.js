document.getElementById('backButton').addEventListener('click', async () => {
    window.history.back();
});

function handleBreakfastClick(menuItem) {
    const button = document.getElementById(`btn-${menuItem}`);
    let scroll = true;

    if (button.classList.contains('selectedBreakfast')) {
        button.classList.remove('selectedBreakfast');
        scroll = false;
    } else {
        document.querySelectorAll('button.panel').forEach(btn => {
            btn.classList.remove('selectedBreakfast');
        });
        button.classList.add('selectedBreakfast');
    }
    updateSubmitButtonState(scroll);
}

function handleLunchClick(menuItem) {
    const button = document.getElementById(`btn-${menuItem}`);
    let scroll = true;

    if (button.classList.contains('selectedLunch')) {
        button.classList.remove('selectedLunch');
        scroll = false;
    } else {
        document.querySelectorAll('button.panel').forEach(btn => {
            btn.classList.remove('selectedLunch');
        });
        button.classList.add('selectedLunch');
    }
    updateSubmitButtonState(scroll);
}

function updateSubmitButtonState(scroll) {
    const isBreakfastSelected = document.querySelector('button.panel.selectedBreakfast') !== null;
    const isLunchSelected = document.querySelector('button.panel.selectedLunch') !== null;

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

function updateMessage(countdown) {
    const messageElement = document.getElementById('confirmationMessage'); 
    const localizedMessage = messageElement.getAttribute('message'); 
    messageElement.innerHTML = localizedMessage.replace('{{seconds}}', countdown);
}

document.getElementById('submitButton').addEventListener('click', async function() {
    if (!this.classList.contains('disabled')) {
        
        const selectedBreakfast = (document.querySelector('button.selectedBreakfast')?.getAttribute('data-order')) || 'none';
        const selectedLunch = (document.querySelector('button.selectedLunch')?.getAttribute('data-order')) || 'none';

        try {
            const response = await fetch('/submitOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ selectedBreakfast, selectedLunch }),
            });

            const result = await response.json();
            if (result.success) {
                const overlay = document.getElementById('confirmationOverlay');
                overlay.classList.add('show');

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
                });
            } else {
                const overlay = document.getElementById('errorOverlay');
                const messageElement = document.getElementById('errorMessage');

                overlay.classList.add('show');
                messageElement.innerHTML = result.message;

                overlay.addEventListener('click', () => {
                    overlay.classList.remove('show');
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});