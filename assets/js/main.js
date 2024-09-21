function handleButtonClick(sheetName) {
    const panel = document.getElementById(`btn-${sheetName}`);
    if (panel.classList.contains('selected')) {
        panel.classList.remove('selected');
    } else {
        document.querySelectorAll('.panel').forEach(btn => {
            btn.classList.remove('selected');
        });
        panel.classList.add('selected');
    }
    updateNextButtonState();
}

function resetNumpads() {
    const mobileNumpad = document.getElementById('mobileNumpad');
    const display = document.getElementById('display');
    
    if (window.innerWidth <= 768) {
        display.innerHTML = '';
    } else {
        mobileNumpad.value = '';
    }
    updateNextButtonState();
}
window.addEventListener('resize', resetNumpads);

document.getElementById('mobileNumpad').addEventListener('input', function (e) {
    if (this.value.length > 3) {
        this.value = this.value.slice(0, 3);
    }
    updateNextButtonState();
});

let display = document.querySelector("#display");
let buttons = document.querySelectorAll('.numBtn');
let clear = document.querySelector("#clearBtn");
let back = document.querySelector("#backBtn");

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => {
        if (display.innerHTML.length < 3) {
            display.innerHTML += buttons[i].innerHTML;
        }
        speakText(display.innerHTML);
        updateNextButtonState();
    });
}

clear.addEventListener('click', () => {
    display.innerHTML = "";
    speakText(clear.innerHTML);
    updateNextButtonState();
})

back.addEventListener('click', () => {
    display.innerHTML = display.innerHTML.slice(0, -1);
    speakText(back.innerHTML);
    updateNextButtonState();
})

function updateNextButtonState() {
    const isPanelSelected = document.querySelector('.selected') !== null;
    const isNumberInDisplay = display.innerHTML || document.getElementById('mobileNumpad').value;

    if (isPanelSelected && isNumberInDisplay) {
        nextButton.classList.remove('disabled');
    } else {
        nextButton.classList.add('disabled');
    }
}

document.getElementById('nextButton').addEventListener('click', async function() {
    if (!this.classList.contains('disabled')) {
        const clickMessage = document.getElementById('afkMessage').getAttribute('data-click-msg');

        const insuranceName = document.querySelector('.selected')?.innerText || 'none';
        const numberID = document.getElementById('display').innerHTML || document.getElementById('mobileNumpad').value;
        
        try {
            const response = await fetch('/confirmMember', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ insuranceName, numberID }),
            });

            const result = await response.json();
            if (result.exists && result.units != '0') {
                sessionStorage.setItem('name', result.name);
                sessionStorage.setItem('insurance', result.insurance);
                sessionStorage.setItem('rowNumber', result.rowNumber);

                const url = `/menu?name=${encodeURIComponent(result.name)}&units=${encodeURIComponent(result.units)}`;
                window.location.href = url;
            } else {
                const overlay = document.getElementById('errorOverlay');
                const messageElement = document.getElementById('errorMessage');

                overlay.classList.add('show');
                messageElement.innerHTML = result.message+'<br>'+clickMessage;
                speakText(result.message);

                overlay.addEventListener('click', () => {
                    overlay.classList.remove('show');
                    stopSpeak();
                });
                display.innerHTML = "";
                updateNextButtonState();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});