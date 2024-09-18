const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');
const { cache } = require('../config/cache');

router.get("/menu", async (req, res) => {
    const { name, units } = req.query;

    if (!name || !units) {
        return res.redirect('/');
    }

    const cacheKey = "menuItems";
    let menuData = cache.get(cacheKey);

    if (!menuData) {
        try {
            const today = new Date().getDay() - 1;
            if (today < 0) {
                return res.status(400).json({ error: 'Invalid day of the week' });
            }

            const range = "Menu!B1:I15";
            const googleSheets = getGoogleSheets();
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
                breakfastRow = breakfastRow[today] || [];
            }

            if (lunchFlag === 'TRUE') {
                lunchRow = lunchRow.flat();
            } else {
                lunchRow = lunchRow[today] || [];
            }

            let breakfastImg = [];
            let breakfastTitle = [];
            let lunchImg = [];
            let lunchTitle = [];

            for (let i = 0; i < breakfastRow.length; i += 2) {
                if (breakfastRow[i + 1] === "") {
                    break;
                }
                breakfastImg.push(breakfastRow[i]);
                breakfastTitle.push(breakfastRow[i + 1]);
            }

            for (let i = 0; i < lunchRow.length; i += 2) {
                if (lunchRow[i + 1] === "") {
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
                },
            };

            cache.set(cacheKey, menuData, 900);

        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    res.render("menu", { name: name, units: units, menuData });
});

module.exports = router;
