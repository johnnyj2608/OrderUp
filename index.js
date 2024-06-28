const express = require("express");

const {google} = require("googleapis");

const app = express();

app.get("/", async (req, res) => {

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({version: "v4", auth: client });

    const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });

    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Menu!A7:E12",
    });

    // Write row(s) to spreadsheet
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Response!A2",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [
                ["John Doe", "BK", "Lunchy"]
            ]
        }
    });

    res.send(getRows.data);
});

app.listen(1337, (req, res) => console.log("Running on 1337!"));