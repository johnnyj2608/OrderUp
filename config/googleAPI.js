const { google } = require('googleapis');
const { getAuthToken } = require('../services/getAuthToken');

const spreadsheetId = process.env.SPREADSHEET_ID;
let googleSheets;
let sheetIds = {}
const rowStores = {
    breakfast: {},
    lunch: {},
    history: {},
};

async function initializeGoogleSheets() {
    try {
        const authToken = await getAuthToken();
        googleSheets = google.sheets({ version: 'v4', auth: authToken });
        console.log('Google Sheets initialization complete.');

        await fetchSheetIds();

        await nextRowInitializer('breakfast', rowStores['breakfast']);
        await nextRowInitializer('lunch', rowStores['lunch']);
        await nextRowInitializer('history', rowStores['history'], true);
    } catch (error) {
        console.error('Error during Google Sheets initialization:', error);
        process.exit(1);
    }
}

async function fetchSheetIds() {
    try {
        const response = await googleSheets.spreadsheets.get({
            spreadsheetId,
        });
        const sheets = response.data.sheets || [];
        sheets.forEach(sheet => {
            const sheetName = sheet.properties.title;
            const sheetId = sheet.properties.sheetId;
            sheetIds[sheetName] = sheetId;
        });
    } catch (error) {
        console.error('Error retrieving sheet IDs:', error);
        throw error;
    }
}

async function nextRowInitializer(sheetName, rowStore, oneCol = false) {
    try {
        const range = `${sheetName}`; 
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const values = response.data.values || [];
        
        if (values.length === 0) {
            console.log('No data found in the sheet.');
            return;
        }
        const headers = values[1];
        const data = values.slice(1);

        for (let i = 0; i < headers.length; i++) {
            const columnValues = data
                .map(row => row[i] || '')
                .filter(value => value); 

            rowStore[i] = columnValues.length + 2;
            if (oneCol) {
                break;
            }
        }
    } catch (error) {
        console.error(`Error retrieving data for ${sheetName}:`, error);
    }
}

function nextRow(sheetType, column) {
    const rowStore = rowStores[sheetType];
    const row = rowStore[column];
    rowStore[column] = row + 1;
    return row;
}

function getGoogleSheets() {
    if (!googleSheets) {
        throw new Error('Google Sheets client not initialized.');
    }
    return googleSheets;
}

function getSheetId(sheetName) {
    return sheetIds[sheetName];
}

module.exports = {
    spreadsheetId,
    getGoogleSheets,
    getSheetId,
    nextRow,
    initializeGoogleSheets,
};