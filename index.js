import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisited() {
    const result = await db.query(
    //"SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
    "SELECT country_code FROM visited_countries WHERE user_id = $1;",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);

}

app.get("/", async (req, res) => {
  const countries = await checkVisited();
  const currentUser = await getCurrentUser();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});
app.post("/add", async (req, res) => {
  const input = (req.body.country || "").trim();
  if (!input) return res.redirect("/?error=Please+enter+a+country");

  try {
    // exact match first
    let { rows } = await db.query(
      `SELECT country_code FROM countries
       WHERE country_name ILIKE $1
       LIMIT 1;`,
      [input]
    );
    // fallback: contains match
    if (rows.length === 0) {
      const r2 = await db.query(
        `SELECT country_code FROM countries
         WHERE country_name ILIKE '%' || $1 || '%'
         ORDER BY length(country_name) ASC
         LIMIT 1;`,
        [input]
      );
      rows = r2.rows;
    }
    if (rows.length === 0) return res.redirect("/?error=Country+not+found");

    const countryCode = rows[0].country_code;

    const result = await db.query(
      `INSERT INTO visited_countries (user_id, country_code)
       VALUES ($1, $2)
       ON CONFLICT (user_id, country_code) DO NOTHING;`,
      [currentUserId, countryCode]
    );

    if (result.rowCount === 0) {
      // duplicate
      return res.redirect("/?error=Already+added");
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/?error=Something+went+wrong");
  }
});


app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name;
  const color = req.body.color;

  const result = await db.query(
    "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
    [name, color]
  );

  const id = result.rows[0].id;
  currentUserId = id;

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});