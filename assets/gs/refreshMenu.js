function refreshMenu() {
  const today = new Date().getDay() - 1;
  if (today === -1) {
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const menuSheet = sheet.getSheetByName('Menu');

  const breakfastRange = menuSheet.getRange('B2:I7');
  const lunchRange = menuSheet.getRange('B10:I15');

  const breakfastData = breakfastRange.getValues();
  const lunchData = lunchRange.getValues();

  const breakfastFlag = menuSheet.getRange('F1').getValue();
  const lunchFlag = menuSheet.getRange('F9').getValue();

  const breakfastSheet = sheet.getSheetByName('Breakfast');
  const lunchSheet = sheet.getSheetByName('Lunch');
  breakfastSheet.getRange(1, 1, 3, breakfastSheet.getMaxColumns()).clearContent();
  lunchSheet.getRange(1, 1, 3, lunchSheet.getMaxColumns()).clearContent();

  let breakfastRow, lunchRow;

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

  const breakfastImg = [];
  const breakfastTitle = [];
  const lunchImg = [];
  const lunchTitle = [];

  for (let i = 0; i < breakfastRow.length; i += 2) {
    if (breakfastRow[i+1] === "") {
      continue;
    }
    breakfastImg.push(`=IMAGE("${breakfastRow[i]}", 2)`);
    breakfastTitle.push(breakfastRow[i + 1]);
  }

  for (let i = 0; i < lunchRow.length; i += 2) {
    if (lunchRow[i+1] === "") {
      continue;
    }
    lunchImg.push(`=IMAGE("${lunchRow[i]}", 2)`);
    lunchTitle.push(lunchRow[i + 1]);
  }

  breakfastSheet.getRange(1, 1, 1, breakfastImg.length).setFormulas([breakfastImg]);
  breakfastSheet.getRange(2, 1, 1, breakfastTitle.length).setValues([breakfastTitle]);

  lunchSheet.getRange(1, 1, 1, lunchImg.length).setFormulas([lunchImg]);
  lunchSheet.getRange(2, 1, 1, lunchTitle.length).setValues([lunchTitle]);

  for (let col = 1; col <= breakfastTitle.length; col++) {
    const formula = `=COUNTA(${breakfastSheet.getRange(4, col).getA1Notation()}:${breakfastSheet.getRange(breakfastSheet.getMaxRows(), col).getA1Notation()})`;
    breakfastSheet.getRange(3, col).setFormula(formula);
  }

  for (let col = 1; col <= lunchTitle.length; col++) {
    const formula = `=COUNTA(${lunchSheet.getRange(4, col).getA1Notation()}:${lunchSheet.getRange(lunchSheet.getMaxRows(), col).getA1Notation()})`;
    lunchSheet.getRange(3, col).setFormula(formula);
  }
}
