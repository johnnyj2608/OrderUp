function handleButtonClick(sheetName) {
    document.querySelectorAll('button.panel').forEach(button => {
        button.classList.remove('selected');
    });

    document.getElementById(`btn-${sheetName}`).classList.add('selected');
    updateNextButtonState();
}

let display = document.querySelector("#display");
let buttons = document.querySelectorAll('.btn');
let clear = document.querySelector("#clearBtn");
let back = document.querySelector("#backBtn");

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => {
        if (display.innerHTML.length < 3) {
            display.innerHTML += buttons[i].innerHTML;
        }
        updateNextButtonState();
    });
}

clear.addEventListener('click', () => {
    display.innerHTML = "";
    updateNextButtonState();
})

back.addEventListener('click', () => {
    display.innerHTML = display.innerHTML.slice(0, -1);
    updateNextButtonState();
})

function updateNextButtonState() {
    const isPanelSelected = document.querySelector('button.panel.selected') !== null;
    const isNumberInDisplay = display.innerHTML.length > 0;

    if (isPanelSelected && isNumberInDisplay) {
        nextButton.classList.remove('disabled');
    } else {
        nextButton.classList.add('disabled');
    }
}

document.getElementById('nextButton').addEventListener('click', async function() {
    if (!this.classList.contains('disabled')) {

        const panelName = document.querySelector('button.selected')?.innerText || 'none';
        const displayNumber = document.getElementById('display').innerHTML;
        
        try {
            const response = await fetch('/confirmMember', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ panelName, displayNumber }),
            });

            const result = await response.json();
            if (result.exists) {
                if (result.units != '0') {
                    sessionStorage.setItem('name', result.name);
                    sessionStorage.setItem('units', result.units);
                    sessionStorage.setItem('insurance', result.insurance);
                    sessionStorage.setItem('rowNumber', result.rowNumber);

                    window.location.href = '/menu';
                } else {
                    alert('You have met your weekly quota.');
                }
            } else {
                alert('The selected panel and display number do not exist.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});