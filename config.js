const NodeCache = require('node-cache');
const { google } = require('googleapis');
const { getAuthToken } = require('./services/getAuthToken');

const cache = new NodeCache();

const spreadsheetId = '1eNlUPP-Cw50W5PIjTy6HchqL6Yo12KFkAqydLvQsI8M';
let googleSheets;

async function initializeGoogleSheets() {
    try {
        const authToken = await getAuthToken();
        googleSheets = google.sheets({ version: 'v4', auth: authToken });
        console.log('Google Sheets initialization complete.');
    } catch (error) {
        console.error('Error during Google Sheets initialization:', error);
        process.exit(1);
    }
}

function getGoogleSheets() {
    if (!googleSheets) {
        throw new Error('Google Sheets client not initialized.');
    }
    return googleSheets;
}

const userInfo = {
    "member": "",
    "units": 0,
    "insurance": "",
    "row": 0,
};

module.exports = {
    cache,
    spreadsheetId,
    initializeGoogleSheets,
    getGoogleSheets,
    userInfo,
};