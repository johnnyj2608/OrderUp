function refreshResponses() {
  const today = new Date().getDay() - 1;
  if (today === -1) {
    return;
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const breakfastSheet = sheet.getSheetByName('Breakfast');
  const lunchSheet = sheet.getSheetByName('Lunch');
  breakfastSheet.getRange('4:1000').clearContent();
  lunchSheet.getRange('4:1000').clearContent();
}