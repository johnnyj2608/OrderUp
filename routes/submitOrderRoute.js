const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId, userInfo } = require('../config');

router.post("/submitOrder", async (req, res) => {
    const { breakfastID, breakfastName, lunchID, lunchName } = req.body;
    const name = userInfo['member'];
    const insurance = userInfo['insurance'];
    const rowNumber = userInfo['rowNumber'];

    try {
        const memberUnitsRange = `${insurance}!E${rowNumber}:F${rowNumber}`;
        const googleSheets = getGoogleSheets();
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

            const updatePromises = [
                googleSheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: await nextRow(googleSheets, spreadsheetId, "Breakfast", String.fromCharCode(65 + parseInt(breakfastID))),
                    valueInputOption: "USER_ENTERED",
                    resource: {
                        values: [[name]],
                    },
                }),

                googleSheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: await nextRow(googleSheets, spreadsheetId, "Lunch", String.fromCharCode(65 + parseInt(lunchID))),
                    valueInputOption: "USER_ENTERED",
                    resource: {
                        values: [[name]],
                    },
                }),

                googleSheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: await nextRow(googleSheets, spreadsheetId, 'History', 'A'),
                    valueInputOption: "USER_ENTERED",
                    resource: {
                        values: [[name, breakfastName, lunchName]],
                    },
                }),

                googleSheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: memberUnitsRange,
                    valueInputOption: "USER_ENTERED",
                    resource: {
                        values: [[units - 1, 'TRUE']],
                    },
                }),
            ];

            await Promise.all(updatePromises);

            res.json({ success: true });
        } else {
            res.json({ success: false, message: req.__('insufficient_units') });
        }

    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false });
    }
});

async function nextRow(googleSheets, spreadsheetId, sheetName, column) {
    const range = `${sheetName}!${column}:${column}`;

    const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    const values = response.data.values || [];
    const nextRow = values.length + 1;
    return `${sheetName}!${column}${nextRow}`; 
}

module.exports = router;
