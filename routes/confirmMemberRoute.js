const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

router.post("/confirmMember", async (req, res) => {
    const { insuranceName, numberID } = req.body;

    try {
        let result = { exists: false, units: null, message: req.__('member_not_found') };
        const today = new Date().getDay() - 1;
        if (today < 0) {
            result = {
                message: req.__('invalid_weekday')
            };
        } else {
            const googleSheets = getGoogleSheets();
            const spreadsheet = await googleSheets.spreadsheets.get({
                spreadsheetId,
            });

            const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title.toLowerCase());
            if (!sheetNames.includes(insuranceName.toLowerCase())) {
                return res.json({ exists: false, message: req.__('insurance_not_found') });
            }

            const range = `${insuranceName}!A:E`;
            const getRows = await googleSheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });

            const rows = getRows.data.values || [];
            let left = 1;
            let right = rows.length - 1;

            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                const midValue = rows[mid][0];

                const units = rows[mid][4];

                if (midValue === numberID) {
                    result = {
                        exists: true,
                        units: units,
                        message: units > 0 ? req.__('member_found') : req.__('zero_units'),
                    };
                    req.session.name = rows[mid][2] || rows[mid][1] || null;
                    req.session.units = units;
                    req.session.insurance = insuranceName;
                    req.session.rowNumber = mid + 1;
                    break;
                } else if (midValue < numberID) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            };
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
