const express = require("express");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");
const path = require("path");
const { initializeGoogleSheets } = require('./config/googleAPI');

const indexRoute = require('./routes/indexRoute');
const mainRoute = require('./routes/mainRoute');
const switchRoute = require('./routes/switchRoute');
const confirmMemberRoute = require('./routes/confirmMemberRoute');
const menuRoute = require('./routes/menuRoute');
const submitOrderRoute = require('./routes/submitOrderRoute');

const app = express();

i18n.configure({
    locales: ['en', 'zh'],
    directory: __dirname + '/locales',
    defaultLocale: 'zh',
    cookie: 'lang',
    objectNotation: true,
});

app.use(cookieParser());
app.use(i18n.init);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
//app.use(express.static("./"));
app.use(express.static(path.join(__dirname, 'assets')));

console.log(path.join(__dirname, 'assets'));

app.use('/', indexRoute);
app.use('/', mainRoute);
app.use('/', switchRoute);
app.use('/', confirmMemberRoute);
app.use('/', menuRoute);
app.use('/', submitOrderRoute);

const startServer = async () => {
    try {
        await initializeGoogleSheets();
        const port = process.env.PORT || 1337;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to initialize Google Sheets client:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
