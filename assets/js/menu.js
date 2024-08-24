function handleBreakfastClick(menuItem) {
    document.querySelectorAll('button.panel').forEach(button => {
        button.classList.remove('selectedBreakfast');
    });

    document.getElementById(`btn-${menuItem}`).classList.add('selectedBreakfast');
    updateSubmitButtonState();
}

function handleLunchClick(menuItem) {
    document.querySelectorAll('button.panel').forEach(button => {
        button.classList.remove('selectedLunch');
    });

    document.getElementById(`btn-${menuItem}`).classList.add('selectedLunch');
    updateSubmitButtonState();
}

function updateSubmitButtonState() {
    const isBreakfastSelected = document.querySelector('button.panel.selectedBreakfast') !== null;
    const isLunchSelected = document.querySelector('button.panel.selectedLunch') !== null;

    if (isBreakfastSelected && isLunchSelected) {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}

document.getElementById('submitButton').addEventListener('click', async function() {
    if (!this.classList.contains('disabled')) {

        const name = sessionStorage.getItem('name');
        const insurance = sessionStorage.getItem('insurance');
        const rowNumber = sessionStorage.getItem('rowNumber');
        
        const selectedBreakfast = (document.querySelector('button.selectedBreakfast')?.getAttribute('data-order')) || 'none';
        const selectedLunch = (document.querySelector('button.selectedLunch')?.getAttribute('data-order')) || 'none';

        try {
            const response = await fetch('/submitOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, selectedBreakfast, selectedLunch, insurance, rowNumber }),
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = '/';
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const name = sessionStorage.getItem('name');
    const units = sessionStorage.getItem('units');

    document.getElementById('name').textContent = name;
    document.getElementById('units').textContent = units;

});

document.getElementById('backButton').addEventListener('click', async () => {
    window.history.back();
});