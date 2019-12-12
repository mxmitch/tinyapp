//Dependencies
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; //default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//Functions
const generateRandomString = function() {
  let result = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const emailExists = function(email) {
  console.log("this is the email",email);
  for (const item in users) {
    console.log("inside for",users[item].email);
    if (users[item]['email'] === email) {
      return users[item];
    }
  }
  return false;
};

//SERVER
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
  console.log("here is cookie",req.cookies);
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  console.log(templateVars, req.cookies);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL",(req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello<b>World</b></body></html>\n");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.editURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(req.body);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body['longURL']; //store new URLs in urlDatabase
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.render(`urls_show`, {shortURL,longURL: urlDatabase[shortURL],user: req.cookies["user_id"]});
});

app.get("/login", (req, res) => {
  let templateVars = { user: users["user_id"] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const user = emailExists(email);
  console.log("here is user", user);

  if (!user) {
    res.status(403).send('No registration for this email');
  }
  if (password === user.password) {
    res.cookie("user_id",user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send('Invalid password');
  }
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.cookies["user_id"] };
  res.render("urls_register", templateVars);
});

app.post("/register" , (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const newUser = id;
  let templateVars = {user: req.cookies["user_id"]};

  if (email === "" || password === "") {
    res.status(400).send('Missing email or password');
  } else if (emailExists(email)) {
    res.status(400).send('Email already registered');
  } else {
    users[newUser] = {};
    users[newUser]['id'] = id;
    users[newUser]['email'] = email;
    users[newUser]['password'] = password;
  }
  res
    .cookie("user_id", id)
    .redirect("/urls");
});

app.post("/logout",(req, res)=> {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});