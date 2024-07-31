function handleButtonClick(sheetName) {
    document.querySelectorAll('button').forEach(button => {
        button.classList.remove('selected');
    });

    document.getElementById(`btn-${sheetName}`).classList.add('selected');
}