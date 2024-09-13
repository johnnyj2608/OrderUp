const express = require('express');
const router = express.Router();
const i18n = require('i18n');

router.get('/switch/:lang', (req, res) => {
    const lang = req.params.lang;
    if (i18n.getLocales().includes(lang)) {
        res.cookie('lang', lang);
        console.log(`Switching to language: ${lang}`);
    } else {
        console.log(`Language ${lang} is not supported.`);
    }
    res.redirect('/');
});

module.exports = router;