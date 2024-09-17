const express = require('express');
const router = express.Router();
const { spreadsheetId, getGoogleSheets, getSheetId, nextRow } = require('../config/googleAPI');

router.post("/submitOrder", async (req, res) => {
    const { breakfastID, breakfastName, lunchID, lunchName } = req.body;
    
    try {
        const memberUnitsRange = `${req.session.insurance}!E${req.session.rowNumber}:F${req.session.rowNumber}`;
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

            const breakfastRow = nextRow('breakfast', breakfastID);
            const lunchRow = nextRow('lunch', lunchID);
            const historyRow = nextRow('history', 0);

            const requests = [
                {
                    updateCells: {
                        range: {
                            sheetId: getSheetId('Breakfast'),
                            startRowIndex: breakfastRow - 1,
                            endRowIndex: breakfastRow,
                            startColumnIndex: breakfastID,
                            endColumnIndex: breakfastID + 1
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: req.session.name } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
                {
                    updateCells: {
                        range: {
                            sheetId: getSheetId('Lunch'),
                            startRowIndex: lunchRow - 1,
                            endRowIndex: lunchRow,
                            startColumnIndex: lunchID,
                            endColumnIndex: lunchID + 1
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: req.session.name } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
                {
                    updateCells: {
                        range: {
                            sheetId: getSheetId('History'),
                            startRowIndex: historyRow - 1,
                            endRowIndex: historyRow,
                            startColumnIndex: 0,
                            endColumnIndex: 3
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: req.session.name } },
                                    { userEnteredValue: { stringValue: breakfastName } },
                                    { userEnteredValue: { stringValue: lunchName } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
                {
                    updateCells: {
                        range: {
                            sheetId: getSheetId(req.session.insurance),
                            startRowIndex: req.session.rowNumber - 1,
                            endRowIndex: req.session.rowNumber,
                            startColumnIndex: 4,
                            endColumnIndex: 6
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { numberValue: units - 1 } },
                                    { userEnteredValue: { boolValue: true } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                }
            ];

            await googleSheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests
                }
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

module.exports = router;
