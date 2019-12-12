//REQUIRE
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const app = express();
app.use(cookieParser());
const PORT = 8080; //default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

//DATABASE
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", 10)
  },
  "il63Aa": {
    id: "il63Aa",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

//HELPER FUNCITONS
const generateRandomString = function() {
  let result = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const emailExists = function(email) {
  for (const user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let newObject = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      newObject[item] = urlDatabase[item];
    }
  }
  return newObject;
};

const findIdByEmail = function(email) {
  let findID = "";
  for (const user in users) {
    if (users[user]['email'] === email) {
      findID = users[user]['id'];
    }
  }
  return findID;
};

//SERVER
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello<b>World</b></body></html>\n");
});

//URLS_INDEX PAGE
app.get("/urls", (req, res) => {
  const currentUserID = req.cookies['user_id'];
  const newDatabase = urlsForUser(currentUserID);
  let templateVars = {
    urls: newDatabase,
    user: users[currentUserID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {}; //store new URLs in urlDatabase
  urlDatabase[shortURL]['longURL'] = req.body['longURL'];
  urlDatabase[shortURL]['userID'] = req.cookies['user_id'];
  res.redirect(`/urls/${shortURL}`);
});

//URLS_NEW
app.get("/urls/new", (req, res) => {
  const currentUserID = req.cookies['user_id'];
  let templateVars = {
    user: users[currentUserID]
  };
  res.render("urls_new", templateVars);
});

//URLS_SHOW
app.get("/urls/:shortURL", (req, res) => {
  const currentUserID = req.cookies['user_id'];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[currentUserID]
  };
  const newDatabase = urlsForUser(currentUserID);
  if (newDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Please login or register');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  if (req.cookies['user_id'] === urlDatabase[shortURL]['userID']) {
    urlDatabase[shortURL] = {}; //store new URLs in urlDatabase
    urlDatabase[shortURL]['longURL'] = req.body.editURL;
    urlDatabase[shortURL]['userID'] = req.cookies['user_id'];
    res.redirect(`/urls`);
  } else {
    res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] === urlDatabase[shortURL]['userID']) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.render(`urls_show`, {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: req.cookies["user_id"]
  });
});

//URLS_LOGIN
app.get("/login", (req, res) => {
  const currentUserID = req.cookies['user_id'];
  let templateVars = {
    user: users[currentUserID]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailExists(email);
  const userFromEmail = findIdByEmail(email);
  if (!user) {
    res.status(403).send('No registration for this email');
  }
  if (bcrypt.compareSync(password, users[userFromEmail]['password'])) {
    res.cookie("user_id", user['id']);
    res.redirect("/urls");
  } else {
    res.status(403).send('Invalid password');
  }
});

//URL_REGISTER
app.get("/register", (req, res) => {
  const currentUserID = req.cookies['user_id'];
  let templateVars = {
    user: users[currentUserID]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = id;

  if (email === "" || password === "") {
    res.status(400).send('Missing email or password');
  } else if (emailExists(email)) {
    res.status(400).send('Email already registered');
  } else {
    users[newUser] = {};
    users[newUser]['id'] = id;
    users[newUser]['email'] = email;
    users[newUser]['password'] = hashedPassword;
  }
  res
    .cookie("user_id", id)
    .redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});