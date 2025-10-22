/*
 *
 *
 */

import axios from "axios";
import express from  "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
    app.render("home");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})
