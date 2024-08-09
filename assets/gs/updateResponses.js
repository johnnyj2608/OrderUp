function updateResponses() {
    const today = new Date().getDay() - 1;
    if (today === -1) {
      return;
    }
  
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const menuSheet = sheet.getSheetByName('Menu');
    const breakfastSheet = sheet.getSheetByName('Breakfast');
    const lunchSheet = sheet.getSheetByName('Lunch');
  
    const breakfastRange = menuSheet.getRange('A2:E7');
    const lunchRange = menuSheet.getRange('A10:E15');
  
    const breakfastData = breakfastRange.getValues();
    const lunchData = lunchRange.getValues();
  
    const breakfastFlag = menuSheet.getRange('E1').getValue();
    const lunchFlag = menuSheet.getRange('E8').getValue();
  
    let breakfastRow, lunchRow;
  
    breakfastSheet.clearContents();
    lunchSheet.clearContents(); 
  
    if (breakfastFlag) {
      breakfastRow = breakfastData.flat();
    } else {
      breakfastRow = breakfastData[today]
    }
  
    if (lunchFlag) {
      lunchRow = lunchData.flat();
    } else {
      lunchRow = lunchData[today]
    }
  
    breakfastRow = breakfastRow
    .map(value => value.trim())
    .filter(value => value !== "")
    .slice(1);
    lunchRow = lunchRow
    .map(value => value.trim())
    .filter(value => value !== "")
    .slice(1);
    
    breakfastSheet.getRange(1, 1, 1, breakfastRow.length).setValues([breakfastRow]);
    lunchSheet.getRange(1, 1, 1, lunchRow.length).setValues([lunchRow]);
  
    for (let col = 1; col <= breakfastRow.length; col++) {
      const formula = `=COUNTA(${breakfastSheet.getRange(3, col).getA1Notation()}:${breakfastSheet.getRange(breakfastSheet.getMaxRows(), col).getA1Notation()})`;
      breakfastSheet.getRange(2, col).setFormula(formula);
    }
  
    for (let col = 1; col <= lunchRow.length; col++) {
      const formula = `=COUNTA(${lunchSheet.getRange(3, col).getA1Notation()}:${lunchSheet.getRange(lunchSheet.getMaxRows(), col).getA1Notation()})`;
      lunchSheet.getRange(2, col).setFormula(formula);
    }
}
  