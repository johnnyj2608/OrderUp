function refreshUnits() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = sheet.getSheets();
  const excludeSheets = ["Breakfast", "Lunch", "Menu", "QR", "History", "Preorders"];

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!excludeSheets.includes(sheetName)) {
      const range = sheet.getDataRange();
      const rows = range.getNumRows();

      for (let i = 2; i<= rows; i++) {
        let schedule = sheet.getRange(i, 4).getValue();

        schedule = schedule.toString();
        let units;
        const scheduleParsed = schedule.replace(/\./g, '');
        units = scheduleParsed.length;
        sheet.getRange(i, 5).setValue(units);
      }
      const maxRows = sheet.getMaxRows();
      sheet.getRange('F2:K' + maxRows).clearContent();
    }
  })
}