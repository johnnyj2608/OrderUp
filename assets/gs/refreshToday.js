function refreshToday() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = sheet.getSheets();
  const excludeSheets = ["Breakfast", "Lunch", "Menu", "QR", "History"]; 

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!excludeSheets.includes(sheetName)) {
      const range = sheet.getDataRange();
      const rows = range.getNumRows();

      for (let i = 2; i<= rows; i++) {
        sheet.getRange(i, 6).setValue(false)
      }
    }
  })
}