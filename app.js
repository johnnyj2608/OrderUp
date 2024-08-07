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

    const excludedSheets = ["Response", "Menu", "QR"];
    const sheetNames = spreadsheet.data.sheets
    .map(sheet => sheet.properties.title)
    .filter(title => !excludedSheets.includes(title));

    res.render("index", { sheetNames });
});

// Fetch daily menu
app.get("/menu", async (req, res) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client });
    const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

    try {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = daysOfWeek[new Date().getDay()];

        const range = "Menu!A1:E15";
        const getRows = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = getRows.data.values || [];
        let breakfastData = [];
        let lunchData = [];

        const breakfastAll = rows[0][4]; 
        const lunchAll = rows[8][4]; 
        
        for (const row of rows) {
            if (rows.indexOf(row) >= 1 && rows.indexOf(row) <= 6) {
                breakfastData.push(row);
            }
            else if (rows.indexOf(row) >= 9 && rows.indexOf(row) <= 14) {
                lunchData.push(row);
            }
        }

        if (breakfastAll === 'TRUE') { 
            breakfastData = breakfastData.flat().filter(item => item.trim() !== '');
        } else {
            breakfastData = breakfastData.find(row => row[0] === today);
        }

        if (lunchAll === 'TRUE') {
            lunchData = lunchData.flat().filter(item => item.trim() !== '');
        } else {
            lunchData = lunchData.find(row => row[0] === today);
        }

        const menuData = {
            breakfast: breakfastData.slice(1),
            lunch: lunchData.slice(1),
        };

        res.render("menu", { menuData });
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Confirm member exists
app.post("/confirmMember", async (req, res) => {
    const { panelName, displayNumber } = req.body;

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
        if (!sheetNames.includes(panelName)) {
            return res.json({ exists: false });
        }

        const range = `${panelName}!A:E`;
        const getRows = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = getRows.data.values || [];
        let result = { exists: false, name: null, units: null };
        
        // Change to binary search
        for (const row of rows) {
            if (row[0] === displayNumber) {
                result = {
                    exists: true,
                    name: row[2] || row[1] || null,
                    units: row[4] || null
                };
                break;
            }
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/", async (req, res) => {

    const {name, breakfast, lunch} = req.body;

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client });
    const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Menu!A7:E12",
    });

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Response!A2",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [[name, breakfast, lunch]],
        },
    });

    res.send("Successfully submitted");
});

app.listen(1337, (req, res) => console.log("Running on 1337!"));