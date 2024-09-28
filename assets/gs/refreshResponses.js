function refreshResponse() {
  const weekday = new Date().getDay() - 1;
  if (weekday === -1) { // Sunday
    return;
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const preordersSheet = ss.getSheetByName('Preorders');
  const breakfastSheet = ss.getSheetByName('Breakfast');
  const lunchSheet = ss.getSheetByName('Lunch');
  const historySheet = ss.getSheetByName('History');

  refreshOrders(breakfastSheet, lunchSheet);
  refreshHistory(historySheet);
  
  const dataRange = preordersSheet.getDataRange();
  const data = dataRange.getValues();
  const rows = data.slice(1);
  
  if (rows.length > 0) {
    rows.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    preordersSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let rowsToDelete = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowDate = new Date(rows[i][0]);
      rowDate.setHours(0, 0, 0, 0);

      if (rowDate.getTime() === today.getTime()) {
        const name = rows[i][1];
        const breakfastCol = rows[i][2];
        const breakfastItem = rows[i][3];
        const lunchCol = rows[i][4];
        const lunchItem = rows[i][5];
        const device = rows[i][6];
        
        const breakfastNextRow = breakfastSheet.getRange(1, breakfastCol, breakfastSheet.getMaxRows()).getValues().filter(String).length + 1; 
        breakfastSheet.getRange(breakfastNextRow, breakfastCol).setValue(name);

        const lunchNextRow = lunchSheet.getRange(1, lunchCol, lunchSheet.getMaxRows()).getValues().filter(String).length + 1; 
        lunchSheet.getRange(lunchNextRow, lunchCol).setValue(name);

        const historyNextRow = historySheet.getRange('A:A').getValues().filter(String).length + 1;
        historySheet.getRange(historyNextRow, 1).setValue(name);
        historySheet.getRange(historyNextRow, 2).setValue(breakfastItem);
        historySheet.getRange(historyNextRow, 3).setValue(lunchItem);
        historySheet.getRange(historyNextRow, 4).setValue(device);

        rowsToDelete++;
      } else if (rowDate.getTime() < today.getTime()) {
        rowsToDelete++;
      } else {
        break;
      }
    }
    if (rowsToDelete > 0) {
      preordersSheet.deleteRows(2, rowsToDelete);
    }
  }
}

function refreshOrders(breakfastSheet, lunchSheet) {
  breakfastSheet.getRange('4:1000').clearContent();
  lunchSheet.getRange('4:1000').clearContent();
}

function refreshHistory(historySheet) {
  let sourceRange = historySheet.getRange('A:EN');
  let sourceData = sourceRange.getValues();
  let targetRange = historySheet.getRange('F:ES');
  sourceRange.clearContent();
  targetRange.setValues(sourceData);

  const todayDate = new Date();
  historySheet.getRange('A1').setValue(todayDate).setNumberFormat("MM/dd/yy");
  historySheet.getRange('A2').setValue('Name');
  historySheet.getRange('B2').setValue('Breakfast');
  historySheet.getRange('C2').setValue('Lunch');
  historySheet.getRange('D2').setValue('Device');
}