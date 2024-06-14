function updateGoogleForm() {

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Menu');
  
    var today = new Date().getDay();
  
    var range;
    switch (today) {
      case 1:
        range = 'B7:E7'; // Monday
        break;
      case 2:
        range = 'B8:E8'; // Tuesday
        break;
      case 3:
        range = 'B9:E9'; // Wednesday
        break;
      case 4:
        range = 'B10:E10'; // Thursday
        break;
      case 5:
        range = 'B11:E11'; // Friday
        break;
      case 6:
        range = 'B12:E12'; // Saturday
        break;
      default:
        return;
    }
  
    range = sheet.getRange(range);
    var values = range.getValues().flat().filter(String);
  
    range = sheet.getRange('A15:A18').clearContent();
    for (var i = 0; i < values.length; i++) {
      sheet.getRange('A' + (15 + i)).setValue(values[i]);
    }
  
    var formId = '';
    var form = FormApp.openById(formId);
  
    var lunchId = ''
    var question = form.getItemById(lunchId);
    question.asMultipleChoiceItem().setChoiceValues(values)
  
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses');
    var range = sheet.getRange('A2:' + sheet.getLastRow()+sheet.getLastColumn());
    range.clearContent();
  }