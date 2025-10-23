/*
 * Cocktail-App
 * Author: Jiahui Wu
 * Date: 2025-10-22
 */

import axios from "axios";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const API_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/random", async (req, res) => {
  try {
    const response = await axios.get(API_URL + "/random.php");
    const drink = result.data.drinks[0];

    // Collect ingredients dynamically
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ingredient) ingredients.push(`${measure || ""} ${ingredient}`);
    }

    res.render("cocktail", { drink, ingredients });
  } catch (error) {
    console.error(error);
    res.send("Error fetching cocktail data 😅");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
