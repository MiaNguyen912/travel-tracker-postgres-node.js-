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
let color;
let num_country;
let currentUser;
let currentUserId = 1;
let page_users = [];

// let page_users = [    //we can give page_users some initial value before using the values from database
//   { id: 1, name: "Angela", color: "teal" },
//   { id: 2, name: "Jack", color: "powderblue" },
// ];
async function checkVisistedCountries(){
  let result = await db.query("SELECT country_code FROM visited_country JOIN page_user ON page_user.id = user_id WHERE user_id = $1;", [currentUserId]);
  visited_countries = []; //clear the list
  result.rows.forEach((row)=>{
    visited_countries.push(row.country_code);
  }); 
  console.log(visited_countries);
  return visited_countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM page_user");
  page_users = result.rows;
  return page_users.find((user) => user.id == currentUserId);
}

// handle database retrieval
app.get("/", async (req, res) => {
  visited_countries = await checkVisistedCountries();
  currentUser = await getCurrentUser();

  res.render("index.ejs", {
    countries: visited_countries, 
    total: visited_countries.length,
    users: page_users,
    color: currentUser.color
  });

  
});

app.post("/add", async(req, res)=>{
  const inputCountry = req.body.country.trim();
  const result = await db.query(
    "SELECT country_code FROM country WHERE LOWER(country_name) like '%' || $1 || '%';",
    [inputCountry.toLowerCase()]
  );

  if (result.rows.length !== 0){
    const countryCode = result.rows[0].country_code;

    if (req.body.deleteCountry === "delete" && visited_countries.includes(countryCode)) {
      await db.query("DELETE FROM visited_country WHERE country_code=$1 and user_id=$2;", [countryCode, currentUserId]);
    } else if (req.body.addCountry === "add" && !visited_countries.includes(countryCode)) {
      await db.query("INSERT INTO visited_country(country_code, user_id) VALUES ($1, $2)", [countryCode, currentUserId]);
    };
      
    res.redirect("/");
  } else {
    res.render("index.ejs", {
      countries: visited_countries,
      total: visited_countries.length,
      error: "Country name does not exist, try again.",
      users: page_users,
      color: color
    });
  }
});

app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    console.log(currentUserId);
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const newUserName = req.body.name;
  const newUserColor = req.body.color;
  const result = await db.query("INSERT INTO page_user(name, color) VALUES ($1, $2) RETURNING id", [newUserName, newUserColor])
  currentUserId = result.rows[0].id;
  console.log(currentUserId);
  res.redirect("/");
});

app.post("/deleteuser", async (req, res)=>{
  if (req.body.delete === "delete") {
    console.log(`Delete user ${currentUser.name}`);
    await db.query("DELETE FROM visited_country WHERE user_id=$1;", [currentUserId]);
    await db.query("DELETE FROM page_user WHERE id = $1;", [currentUserId]);

  };
  const result = await db.query("select id from page_user where id = (select min(id) from page_user)");
  currentUserId = result.rows[0].id; //render the first user after delete current user
  res.redirect("/");
  
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
