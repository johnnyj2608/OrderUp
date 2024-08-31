const express = require("express");
const {google} = require("googleapis");
const NodeCache = require("node-cache");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");

const app = express();

i18n.configure({
    locales: ['en', 'zh'],
    directory: __dirname + '/locales',
    defaultLocale: 'zh',
    cookie: 'lang',
    objectNotation: true,
});

app.use(cookieParser());
app.use(i18n.init);

app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./"));

const insuranceImgMap = {
    "aetna": "/assets/img/insurances/aetna.png",
    "ant": "/assets/img/insurances/anthem.png",
    "abc": "/assets/img/insurances/anthem.png",
    "anthem": "/assets/img/insurances/anthem.png",
    "anthembluecross": "/assets/img/insurances/anthem.png",
    "cl": "/assets/img/insurances/centerlight.png",
    "centerlight": "/assets/img/insurances/centerlight.png",
    "hs": "/assets/img/insurances/hamaspik.png",
    "hamaspik": "/assets/img/insurances/hamaspik.png",
    "hf": "/assets/img/insurances/homefirst.png",
    "homefirst": "/assets/img/insurances/homefirst.png",
    "rs": "/assets/img/insurances/riverspring.png",
    "riverspring": "/assets/img/insurances/riverspring.png",
    "swh": "/assets/img/insurances/seniorwhole.png",
    "seniorwholehealth": "/assets/img/insurances/seniorwhole.png",
    "vcm": "/assets/img/insurances/villagecare.png",
    "villagecaremax": "/assets/img/insurances/villagecare.png"
};

app.get('/switch/:lang', (req, res) => {
    const lang = req.params.lang;
    if (i18n.getLocales().includes(lang)) {
        res.cookie('lang', lang);
        console.log(`Switching to language: ${lang}`);
    } else {
        console.log(`Language ${lang} is not supported.`);
    }
    res.redirect('back');
});

app.get("/", async (req, res) => {
    res.render("index");
});

const cache = new NodeCache();

// Select insurance and input member ID
app.get("/main", async (req, res) => {
    const cacheKey = "sheetNames";
    let sheetNames = cache.get(cacheKey);

    if (!sheetNames) {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });
        const spreadsheetId = "1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M";

        const spreadsheet = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId,
        });

        const excludedSheets = ["breakfast", "lunch", "menu", "qr"];
        sheetNames = spreadsheet.data.sheets
            .map(sheet => sheet.properties.title.toLowerCase())
            .filter(title => !excludedSheets.includes(title));

        cache.set(cacheKey, sheetNames, 900);
    }

    res.render("main", { sheetNames, insuranceImgMap });
});

const sessions = {
    "member" : "",
    "units" : 0,
    "insurance" : "",
    "row" : 0,
};

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

        const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title.toLowerCase());
        if (!sheetNames.includes(insuranceName)) {
            return res.json({ exists: false });
        }

        const range = `${insuranceName}!A:E`;
        const getRows = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = getRows.data.values || [];
        let result = { exists: false, units: null, message: req.__('member_not_found') };
        
        let left = 1;
        let right = rows.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midValue = rows[mid][0]

            const units = rows[mid][4];

            if (midValue === numberID) {
                result = {
                    exists: true,
                    units: units,
                    message: units > 0 ? req.__('member_found') : req.__('zero_units'),
                };
                sessions["member"] = rows[mid][2] || rows[mid][1] || null;
                sessions["units"] = units;
                sessions["insurance"] = insuranceName;
                sessions["rowNumber"] = mid + 1;
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

// Fetch daily menu
app.get("/menu", async (req, res) => {
    const member = sessions['member'];
    const units = sessions['units'];

    const cacheKey = "menuItems";
    let menuData = cache.get(cacheKey);

    if (!menuData) {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });
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

            menuData = {
                breakfast: {
                    images: breakfastImg,
                    titles: breakfastTitle,
                },
                lunch: {
                    images: lunchImg,
                    titles: lunchTitle,
                }
            };

            cache.set(cacheKey, menuData, 900);

        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    res.render("menu", { name: member, units, menuData });
});

app.post("/submitOrder", async (req, res) => {
    const { selectedBreakfast, selectedLunch } = req.body;
    const name = sessions['member'];
    const insurance = sessions['insurance'];
    const rowNumber = sessions['rowNumber'];

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
                return res.json({ success: false, message: req.__('already_ordered') });
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
            res.json({ success: false, message: req.__('insufficient_units') });
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