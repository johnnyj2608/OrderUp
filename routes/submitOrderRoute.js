const express = require('express');
const router = express.Router();
const { spreadsheetId, getGoogleSheets, getSheetId, getNextRow } = require('../config/googleAPI');

router.post("/submitOrder", async (req, res) => {
    const { 
        name,
        insurance,
        rowNumber,
        breakfastID, 
        breakfastName, 
        lunchID, 
        lunchName,
        deviceType
     } = req.body;

    try {
        const breakfastSheetIdPromise = getSheetId('Breakfast');
        const lunchSheetIdPromise = getSheetId('Lunch');
        const historySheetIdPromise = getSheetId('History');
        const insuranceSheetIdPromise = getSheetId(insurance);
        
        const breakfastRowPromise = getNextRow('breakfast', breakfastID);
        const lunchRowPromise = getNextRow('lunch', lunchID);
        const historyRowPromise = getNextRow('history', 0);

        const memberUnitsRange = `${insurance}!E${rowNumber}:F${rowNumber}`;
        const googleSheets = getGoogleSheets();
        const insurancePromise = googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: memberUnitsRange,
        });

        const [
            breakfastSheetId,
            lunchSheetId,
            historySheetId,
            insuranceSheetId,
            breakfastRow,
            lunchRow,
            historyRow,
            insuranceResponse
        ] = await Promise.all([
            breakfastSheetIdPromise,
            lunchSheetIdPromise,
            historySheetIdPromise,
            insuranceSheetIdPromise,
            breakfastRowPromise,
            lunchRowPromise,
            historyRowPromise,
            insurancePromise
        ]);

        const values = insuranceResponse.data.values ? insuranceResponse.data.values[0] : [0, 'FALSE'];
        const units = parseFloat(values[0]) || 0;
        const orderedToday = values[1] === 'TRUE';

        if (units > 0) {
            if (orderedToday) {
                return res.json({ success: false, message: req.__('already_ordered') });
            }

            const requests = [
                {
                    updateCells: {
                        range: {
                            sheetId: breakfastSheetId,
                            startRowIndex: breakfastRow - 1,
                            endRowIndex: breakfastRow,
                            startColumnIndex: breakfastID,
                            endColumnIndex: breakfastID + 1
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: name } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
                {
                    updateCells: {
                        range: {
                            sheetId: lunchSheetId,
                            startRowIndex: lunchRow - 1,
                            endRowIndex: lunchRow,
                            startColumnIndex: lunchID,
                            endColumnIndex: lunchID + 1
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: name } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
                {
                    updateCells: {
                        range: {
                            sheetId: historySheetId,
                            startRowIndex: historyRow - 1,
                            endRowIndex: historyRow,
                            startColumnIndex: 0,
                            endColumnIndex: 4
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { stringValue: name } },
                                    { userEnteredValue: { stringValue: breakfastName } },
                                    { userEnteredValue: { stringValue: lunchName } },
                                    { userEnteredValue: { stringValue: deviceType } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                },
                {
                    updateCells: {
                        range: {
                            sheetId: insuranceSheetId,
                            startRowIndex: rowNumber - 1,
                            endRowIndex: rowNumber,
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
