const express = require("express");
const {google} = require("googleapis");

const app = express();

app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./"));

// Select insurance and input member ID
app.get("/", async (req, res) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client});
    const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

    const spreadsheet = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });

    const excludedSheets = ["Breakfast", "Lunch", "Menu", "QR"];
    const sheetNames = spreadsheet.data.sheets
    .map(sheet => sheet.properties.title)
    .filter(title => !excludedSheets.includes(title));

    res.render("index", { sheetNames });
});

// Fetch daily menu
app.post("/menu", async (req, res) => {
    const { name, units } = req.body;

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client });
    const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

    try {
        const today = new Date().getDay() - 1;
        if (today < 0) {
            return res.status(400).json({ error: 'Invalid day of the week' });
        }

        const range = "Menu!B1:I15";
        const getRows = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const menuRows = getRows.data.values || [];
        const breakfastFlag = menuRows[0][4]; 
        const lunchFlag = menuRows[8][4];

        let breakfastRow = [];
        let lunchRow = [];

        for (let i = 1; i <= 6; i++) {
            breakfastRow.push(menuRows[i]);
        }
        for (let i = 9; i <= 14; i++) {
            lunchRow.push(menuRows[i]);
        }

        if (breakfastFlag === 'TRUE') {
            breakfastRow = breakfastRow.flat();
        } else {
            breakfastRow = breakfastRow[today] || []
        }
    
        if (lunchFlag === 'TRUE') {
            lunchRow = lunchRow.flat();
        } else {
            lunchRow = lunchRow[today] || []
        }

        let breakfastImg = [];
        let breakfastTitle = [];
        let lunchImg = [];
        let lunchTitle = [];

        for (let i = 0; i < breakfastRow.length; i += 2) {
            if (breakfastRow[i+1] === "") {
              break;
            }
            breakfastImg.push(breakfastRow[i]);
            breakfastTitle.push(breakfastRow[i + 1]);
          }
        
          for (let i = 0; i < lunchRow.length; i += 2) {
            if (lunchRow[i+1] === "") {
              break;
            }
            lunchImg.push(lunchRow[i]);
            lunchTitle.push(lunchRow[i + 1]);
          }

        const menuData = {
            breakfast: {
                images: breakfastImg,
                titles: breakfastTitle,
            },
            lunch: {
                images: lunchImg,
                titles: lunchTitle,
            }
        };

        res.render("menu", { name, units, menuData });

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Confirm member exists
app.post("/confirmMember", async (req, res) => {
    const { insuranceName, numberID } = req.body;

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client });
    const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

    try {
        const spreadsheet = await googleSheets.spreadsheets.get({
            spreadsheetId,
        });

        const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
        if (!sheetNames.includes(insuranceName)) {
            return res.json({ exists: false });
        }

        const range = `${insuranceName}!A:E`;
        const getRows = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = getRows.data.values || [];
        let result = { exists: false, name: null, units: null, message: "Member ID not found." };
        
        let left = 1;
        let right = rows.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midValue = rows[mid][0]

            const units = rows[mid][4];

            if (midValue === numberID) {
                result = {
                    exists: true,
                    name: rows[mid][2] || rows[mid][1] || null,
                    units: units,
                    insurance: insuranceName,
                    rowNumber: mid + 1,
                    message: units > 0 ? "Member ID found." : "Member has 0 weekly units remaining."
                };
                break
            } else if (midValue < numberID) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        };

        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/submitOrder", async (req, res) => {
    const { name, selectedBreakfast, selectedLunch, insurance, rowNumber } = req.body;

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client });
    const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

    try {
        const memberUnitsRange = `${insurance}!E${rowNumber}:F${rowNumber}`;
        const insuranceResponse = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: memberUnitsRange,
        });
        const values = insuranceResponse.data.values ? insuranceResponse.data.values[0] : [0, 'FALSE'];
        const units = parseFloat(values[0]) || 0;
        const orderedToday = values[1] === 'TRUE';
        if (units > 0) {
            if (orderedToday) {
                return res.json({ success: false, message: "Member has already ordered today." });
            }
            await writeorder(googleSheets, spreadsheetId, "Breakfast", selectedBreakfast, name);
            await writeorder(googleSheets, spreadsheetId, "Lunch", selectedLunch, name);

            await googleSheets.spreadsheets.values.update({
                spreadsheetId,
                range: memberUnitsRange,
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [[units - 1, 'TRUE']],
                },
            });

            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Insufficient insurance units to place order." });
        }

    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false });
    }
});

async function writeorder(sheets, spreadsheetId, sheetName, columnID, name) {
    const columnLetter = String.fromCharCode(65 + parseInt(columnID));
    const range = `${sheetName}!${columnLetter}:${columnLetter}`;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const values = response.data.values || [];
    const nextRow = values.length + 1;
    const rangeToAppend = `${sheetName}!${columnLetter}${nextRow}`; 

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: rangeToAppend,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [[name]],
        },
    });
}

app.listen(1337, (req, res) => console.log("Running on 1337!"));