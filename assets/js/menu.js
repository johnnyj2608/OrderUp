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

document.addEventListener('DOMContentLoaded', function() {
    const name = sessionStorage.getItem('name');
    const units = sessionStorage.getItem('units');

    if (name) {
        document.getElementById('name').innerText = name;
    }

    if (units) {
        document.getElementById('units').innerText = units; 
    }
});

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
        const selectedBreakfast = document.querySelector('button.selectedBreakfast')?.innerText || 'none';
        const selectedLunch = document.querySelector('button.selectedLunch')?.innerText || 'none';
        
        try {
            const response = await fetch('/submitOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, selectedBreakfast, selectedLunch }),
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = '/';
            } else {
                alert('Failed to submit order.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});