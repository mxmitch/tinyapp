const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

const generateRandomString = function() {
  let result = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/",(req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json",(req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL",(req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase.shortURL};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello<b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(req.body);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body['longURL']; //store new URLs in urlDatabase
  res.redirect(`/urls/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});