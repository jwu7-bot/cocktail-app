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

// GET route - home route
app.get("/", (req, res) => {
  res.render("index");
});

// GET route - show random cocktail
app.get("/random", async (req, res) => {
  try {
    const response = await axios.get(API_URL + "/random.php");

    const drink = response.data.drinks[0];

    // Collect ingredients dynamically
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ingredient) ingredients.push(`${measure || ""} ${ingredient}`);
    }

    res.render("random", { drink, ingredients });
  } catch (error) {
    console.error("Error fetching cocktail data:", error.message);

    // Send empty drink and empty ingredients so EJS still renders
    const drink = {
      strDrink: "No cocktail available",
      strDrinkThumb: "",
      strInstructions: "Sorry, we couldn't fetch the recipe at the moment.",
    };
    const ingredients = [];

    res.render("random", { drink, ingredients });
  }
});

// GET route - show cocktail by ID
app.get("/cocktail/:id", async (req, res) => {
  const cocktailId = req.params.id;

  try {
    const response = await axios.get(`${API_URL}/lookup.php?i=${cocktailId}`);
    const drink = response.data.drinks[0];

     // Collect ingredients dynamically
    const ingredients = Array.from({ length: 15 }, (_, i) => {
      const ingredient = drink[`strIngredient${i + 1}`];
      const measure = drink[`strMeasure${i + 1}`];
      return ingredient ? `${(measure || "").trim()} ${ingredient}`.trim() : null;
    }).filter(Boolean);

    res.render("cocktail-details", { drink, ingredients });
  } catch (error) {
    console.error("Error fetching cocktail data:", error.message);

    // Send empty drink and empty ingredients so EJS still renders
    const drink = {
      strDrink: "No cocktail available",
      strDrinkThumb: "",
      strInstructions: "Sorry, we couldn't fetch the recipe at the moment.",
    };
    const ingredients = [];

    res.render("random", { drink, ingredients });
  }
});

// GET route - show empty search form
app.get("/search-name", async (req, res) => {
  res.render("search-name", { drinks: [], searchTerm: "" });
});

// POST route - handle cocktail name search
app.post("/search-name", async (req, res) => {
  const searchTerm = req.body.name;

  try {
    const response = await axios.get(`${API_URL}/search.php?s=${searchTerm}`);
    const drinks = response.data.drinks || [];

    res.render("search-name", { drinks, searchTerm });
  } catch (error) {
    console.error("Error searching by name:", error.message);
    res.render("search-name", { drinks: [], searchTerm });
  }
});

// GET route - show empty search form
app.get("/search-ingredient", (req, res) => {
  res.render("search-ingredient", { drinks: [], searchTerm: "" });
});

// POST route - handle ingredient search
app.post("/search-ingredient", async (req, res) => {
  const searchTerm = req.body.ingredient;

  try {
    const response = await axios.get(`${API_URL}/filter.php?i=${searchTerm}`);
    const drinks = response.data.drinks || [];

    res.render("search-ingredient", { drinks, searchTerm });
  } catch (error) {
    console.error("Error searching by ingredient:", error.message);
    res.render("search-ingredient", { drinks: [], searchTerm });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
