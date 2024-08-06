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

updateNextButtonState();
