function handleButtonClick(sheetName) {
    document.querySelectorAll('button.panel').forEach(button => {
        button.classList.remove('selected');
    });

    document.getElementById(`btn-${sheetName}`).classList.add('selected');
}

let display = document.querySelector("#display");
let buttons = document.querySelectorAll('.btn');
let clear = document.querySelector("#clearBtn");
let back = document.querySelector("#backBtn");

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => {
        display.innerHTML += buttons[i].innerHTML;

    });
}

clear.addEventListener('click', () => {
    display.innerHTML = "";
})

back.addEventListener('click', () => {
    display.innerHTML = display.innerHTML.slice(0, -1);
})