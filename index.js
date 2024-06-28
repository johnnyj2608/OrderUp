const express = require("express");

const {google} = require("googleapis");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.listen(1337, (req, res) => console.log("Running on 1337!"));