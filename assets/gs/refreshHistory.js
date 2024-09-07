function refreshHistory() {
    const today = new Date().getDay() - 1;
    if (today === -1) {
        return;
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const historySheet = sheet.getSheetByName('History');

    let sourceRange = historySheet.getRange('A:DK');
    let sourceData = sourceRange.getValues();
    let targetRange = historySheet.getRange('E:DO');
    sourceRange.clearContent();
    targetRange.setValues(sourceData);

    const todayDate = new Date();
    historySheet.getRange('A1').setValue(todayDate).setNumberFormat("MM/dd/yy");
    historySheet.getRange('A2').setValue('Name');
    historySheet.getRange('B2').setValue('Breakfast');
    historySheet.getRange('C2').setValue('Lunch');
}
  