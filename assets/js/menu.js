function handleButtonClick(sheetName) {
    document.querySelectorAll('button.panel').forEach(button => {
        button.classList.remove('selected');
    });

    document.getElementById(`btn-${sheetName}`).classList.add('selected');
    updateNextButtonState();
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