const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

router.post("/confirmMember", async (req, res) => {
    const { insuranceName, numberID, weekday } = req.body;

    try {
        let result = { exists: false, units: null, message: req.__('member_not_found', numberID) };
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

            const trimmedInsuranceName = insuranceName.trim()
            const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title.toLowerCase());
            if (!sheetNames.includes(trimmedInsuranceName.toLowerCase())) {
                return res.json({ 
                    exists: false, 
                    message: req.__('insurance_not_found', trimmedInsuranceName)
                });
            }

            const range = `${trimmedInsuranceName}!A:K`;
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
                        name: rows[mid][2] || rows[mid][1] || null,
                        insurance: trimmedInsuranceName,
                        rowNumber: mid + 1,
                        ordered: rows[mid][4+Number(weekday)] === 'TRUE',  
                    };
                    break;
                } else if (midValue < numberID) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            };
        }

        if (result.ordered) {
            const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            result.message = req.__('already_ordered', req.__(daysOfWeek[weekday]));
        }

        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
