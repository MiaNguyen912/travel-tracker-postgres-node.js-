import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world", //this database will includes
  password: "password",
  port: 5433
});
db.connect()

let visited_countries = [];
let num_country;
let currentUserId = 1;
let page_users = [];

// let page_users = [    //we can give page_users some initial value before using the values from database
//   { id: 1, name: "Angela", color: "teal" },
//   { id: 2, name: "Jack", color: "powderblue" },
// ];


// handle database retrieval
app.get("/", async (req, res) => {
  const result = await db.query("select country_code from visited_country");
  visited_countries = []; //clear the list
  result.rows.forEach((row)=>{
    visited_countries.push(row.country_code);
  }); 
  num_country = visited_countries.length;
  console.log(visited_countries);
  // console.log(result.rows);

  const result2 = await db.query("SELECT * FROM page_user");
  page_users = result2.rows;

  res.render("index.ejs", {
    countries: visited_countries, 
    total: num_country,
    users: page_users,
    color: "teal"})
});

app.post("/add", async(req, res)=>{
  const inputCountry = req.body.country.trim();
  const result = await db.query(
    "SELECT country_code FROM country WHERE LOWER(country_name) like '%' || $1 || '%';",
    [inputCountry.toLowerCase()]
  );
  console.log(result.rows);

  if (result.rows.length !== 0){
    const countryCode = result.rows[0].country_code;
    if (!visited_countries.includes(countryCode))
      await db.query("INSERT INTO visited_country(country_code) VALUES ($1)",
      [countryCode]);
    res.redirect("/");
  } else {
    res.render("index.ejs", {
      countries: visited_countries,
      total: visited_countries.length,
      error: "Country name does not exist, try again.",
      users: page_users,
      color: "teal"
    });
  }
  
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
