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

const PAGE_SIZE = 9; // 3x3 grid

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
  res.render("search-name", { drinks: [], searchTerm: "", totalPages: 0});
});

// POST route - handle cocktail name search
app.post("/search-name", async (req, res) => {
  const searchTerm = req.body.name;
  const page = parseInt(req.query.page) || 1;

  try {
    const response = await axios.get(`${API_URL}/search.php?s=${searchTerm}`);
    const drinks = Array.isArray(response.data.drinks) ? response.data.drinks : [];

    const totalResults = drinks.length;
    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedDrinks = drinks.slice(startIndex, startIndex + PAGE_SIZE);

    res.render("search-name", {
      drinks: paginatedDrinks,
      searchTerm,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error searching by name:", error.message);
    res.render("search-name", { drinks: [], searchTerm, page: 1, totalPages: 1 });
  }
});

// GET route - show empty search form
app.get("/search-ingredient", (req, res) => {
  res.render("search-ingredient", { drinks: [], searchTerm: "", totalPages: 0 });
});

// POST route - handle ingredient search
app.post("/search-ingredient", async (req, res) => {
  const searchTerm = req.body.ingredient;
  const page = parseInt(req.query.page) || 1;

  try {
    const response = await axios.get(`${API_URL}/filter.php?i=${searchTerm}`);
    const drinks = Array.isArray(response.data.drinks) ? response.data.drinks : [];

    // Calculate pagination
    const totalResults = drinks.length;
    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedDrinks = drinks.slice(startIndex, startIndex + PAGE_SIZE);

    res.render("search-ingredient", {
      drinks: paginatedDrinks,
      searchTerm,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error searching by ingredient:", error.message);
    res.render("search-ingredient", { drinks: [], searchTerm, page: 1, totalPages: 1 });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
