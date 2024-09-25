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
        deviceType,
        weekday
     } = req.body;

    try {
        const breakfastSheetIdPromise = getSheetId('Breakfast');
        const lunchSheetIdPromise = getSheetId('Lunch');
        const historySheetIdPromise = getSheetId('History');
        const preordersSheetIdPromise = getSheetId('Preorders');
        const insuranceSheetIdPromise = getSheetId(insurance);
        
        const breakfastRowPromise = getNextRow('breakfast', breakfastID);
        const lunchRowPromise = getNextRow('lunch', lunchID);
        const historyRowPromise = getNextRow('history', 0);
        const preordersRowPromise = getNextRow('preorders', 0);

        const memberUnitsRange = `${insurance}!E${rowNumber}:K${rowNumber}`;
        const googleSheets = getGoogleSheets();
        const insurancePromise = googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: memberUnitsRange,
        });

        const [
            breakfastSheetId,
            lunchSheetId,
            historySheetId,
            preordersSheetId,
            insuranceSheetId,
            breakfastRow,
            lunchRow,
            historyRow,
            preordersRow,
            insuranceResponse
        ] = await Promise.all([
            breakfastSheetIdPromise,
            lunchSheetIdPromise,
            historySheetIdPromise,
            preordersSheetIdPromise,
            insuranceSheetIdPromise,
            breakfastRowPromise,
            lunchRowPromise,
            historyRowPromise,
            preordersRowPromise,
            insurancePromise
        ]);

        const values = insuranceResponse.data.values;
        const units = parseFloat(values[0]) || 0;
        const orderedToday = values[weekday] === 'TRUE';

        if (units > 0) {
            if (orderedToday) {
                return res.json({ success: false, message: req.__('already_ordered', weekday) });
            }

            let requests = [];
            const currentDayIndex = new Date().getDay();

            if (Number(weekday) === currentDayIndex) {
                requests = [
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
                ];
            } else {
                requests = [
                    {
                        updateCells: {
                            range: {
                                sheetId: preordersSheetId,
                                startRowIndex: preordersRow - 1,
                                endRowIndex: preordersRow,
                                startColumnIndex: 0,
                                endColumnIndex: 7
                            },
                            rows: [
                                {
                                    values: [
                                        { userEnteredValue: { numberValue: getNextDateAsNumber(weekday) } },
                                        { userEnteredValue: { stringValue: name } },
                                        { userEnteredValue: { numberValue: breakfastID+1 } },
                                        { userEnteredValue: { stringValue: breakfastName } },
                                        { userEnteredValue: { numberValue: lunchID+1 } },
                                        { userEnteredValue: { stringValue: lunchName } },
                                        { userEnteredValue: { stringValue: deviceType } }
                                    ]
                                }
                            ],
                            fields: 'userEnteredValue'
                        }
                    },
                ];
            }

            requests.push(
                {
                    updateCells: {
                        range: {
                            sheetId: insuranceSheetId,
                            startRowIndex: rowNumber - 1,
                            endRowIndex: rowNumber,
                            startColumnIndex: 4,
                            endColumnIndex: 5
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { numberValue: units - 1 } }
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
                            startColumnIndex: 4 + Number(weekday),
                            endColumnIndex: 5 + Number(weekday)
                        },
                        rows: [
                            {
                                values: [
                                    { userEnteredValue: { boolValue: true } }
                                ]
                            }
                        ],
                        fields: 'userEnteredValue'
                    }
                }
            );

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

const getNextDateAsNumber = (weekday) => {
    const currentDate = new Date();
    const baseDate = new Date(1899, 11, 30);    
    const totalDaysFromBase = Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDayIndex = currentDate.getDay();
    let daysToAdd;

    if (weekday >= currentDayIndex) {
        daysToAdd = weekday - currentDayIndex; // Same week
    } else {
        daysToAdd = (7 - currentDayIndex) + weekday; // Next week
    }
    
    return totalDaysFromBase + daysToAdd;
};

module.exports = router;
