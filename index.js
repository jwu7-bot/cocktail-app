/*
 * Cocktail-App
 * Author: Jiahui Wu
 * Date: 2025-11-06
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

/* =========================
   Homepage (GET)
========================= */
app.get("/", (req, res) => {
  res.render("index");
});

/* =========================
   Random cocktail (GET)
========================= */
app.get("/random", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/random.php`);
    const drink = response.data.drinks[0];

    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ingredient) ingredients.push(`${measure || ""} ${ingredient}`.trim());
    }

    res.render("random", { drink, ingredients });
  } catch (error) {
    console.error("Error fetching cocktail data:", error.message);
    const drink = {
      strDrink: "No cocktail available",
      strDrinkThumb: "",
      strInstructions: "Sorry, we couldn't fetch the recipe at the moment.",
    };
    const ingredients = [];
    res.render("random", { drink, ingredients });
  }
});

/* =========================
   Show cocktail by ID (GET)
========================= */
app.get("/cocktail/:id", async (req, res) => {
  const cocktailId = req.params.id;

  try {
    const response = await axios.get(`${API_URL}/lookup.php?i=${cocktailId}`);
    const drink = response.data.drinks[0];

    const ingredients = Array.from({ length: 15 }, (_, i) => {
      const ingredient = drink[`strIngredient${i + 1}`];
      const measure = drink[`strMeasure${i + 1}`];
      return ingredient
        ? `${(measure || "").trim()} ${ingredient}`.trim()
        : null;
    }).filter(Boolean);

    res.render("cocktail-details", { drink, ingredients });
  } catch (error) {
    console.error("Error fetching cocktail data:", error.message);
    const drink = {
      strDrink: "No cocktail available",
      strDrinkThumb: "",
      strInstructions: "Sorry, we couldn't fetch the recipe at the moment.",
    };
    const ingredients = [];
    res.render("random", { drink, ingredients });
  }
});

/* =========================
   Search by Name (GET)
========================= */
app.get("/search-name", async (req, res) => {
  const searchTerm = req.query.name || "";
  const page = parseInt(req.query.page) || 1;

  let drinks = [];
  let totalPages = 0;

  if (searchTerm) {
    try {
      const response = await axios.get(`${API_URL}/search.php?s=${searchTerm}`);
      drinks = Array.isArray(response.data.drinks) ? response.data.drinks : [];
      const totalResults = drinks.length;
      totalPages = Math.ceil(totalResults / PAGE_SIZE);
      const startIndex = (page - 1) * PAGE_SIZE;
      drinks = drinks.slice(startIndex, startIndex + PAGE_SIZE);
    } catch (error) {
      console.error("Error searching by name:", error.message);
      drinks = [];
      totalPages = 0;
    }
  }

  res.render("search-name", { drinks, searchTerm, page, totalPages });
});

/* =========================
   Search by Ingredient (GET)
========================= */
app.get("/search-ingredient", async (req, res) => {
  const searchTerm = req.query.ingredient || "";
  const page = parseInt(req.query.page) || 1;

  let drinks = [];
  let totalPages = 0;

  if (searchTerm) {
    try {
      const response = await axios.get(`${API_URL}/filter.php?i=${searchTerm}`);
      drinks = Array.isArray(response.data.drinks) ? response.data.drinks : [];
      const totalResults = drinks.length;
      totalPages = Math.ceil(totalResults / PAGE_SIZE);
      const startIndex = (page - 1) * PAGE_SIZE;
      drinks = drinks.slice(startIndex, startIndex + PAGE_SIZE);
    } catch (error) {
      console.error("Error searching by ingredient:", error.message);
      drinks = [];
      totalPages = 0;
    }
  }

  res.render("search-ingredient", { drinks, searchTerm, page, totalPages });
});

/* =========================
   List Categories (GET)
========================= */
app.get("/categories", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/list.php?c=list`);
    const categories = response.data.drinks.map((d) => d.strCategory);
    res.render("categories", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.render("categories", { categories: [] });
  }
});

/* =========================
   Cocktails in Categories (GET)
========================= */
app.get("/category/:name", async (req, res) => {
  const categoryName = req.params.name;
  const page = parseInt(req.query.page) || 1;

  try {
    const response = await axios.get(
      `${API_URL}/filter.php?c=${encodeURIComponent(categoryName)}`
    );
    const drinks = Array.isArray(response.data.drinks)
      ? response.data.drinks
      : [];

    const PAGE_SIZE = 9;
    const totalResults = drinks.length;
    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedDrinks = drinks.slice(startIndex, startIndex + PAGE_SIZE);

    res.render("category-drinks", {
      drinks: paginatedDrinks,
      categoryName,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching category drinks:", error.message);
    res.render("category-drinks", {
      drinks: [],
      categoryName,
      page: 1,
      totalPages: 1,
    });
  }
});

/* =========================
   Start server
========================= */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
