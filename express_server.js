//REQUIRE
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const findIdByEmail = require('./helpers.js');
const emailExists = require('./helpers.js');
const generateRandomString = require('./helpers.js');
const urlsForUser = require('./helpers.js');

//SETUP
const PORT = 8080; //default port 8080
const app = express();


app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

//-----------------REQUEST/RESPONSE--------------------//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello<b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  const currentUserID = req.session.user_id;
  const newDatabase = urlsForUser.urlsForUser(currentUserID, urlDatabase);
  let templateVars = {
    urls: newDatabase,
    user: users[currentUserID]
  };
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

//URLS_INDEX PAGE
app.get("/urls", (req, res) => {
  const currentUserID = req.session.user_id;
  const newDatabase = urlsForUser.urlsForUser(currentUserID, urlDatabase);
  let templateVars = {
    urls: newDatabase,
    user: users[currentUserID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString.generateRandomString();
  urlDatabase[shortURL] = {}; //store new URLs in urlDatabase
  urlDatabase[shortURL]['longURL'] = req.body['longURL'];
  urlDatabase[shortURL]['userID'] = req.session.user_id;
  res.redirect(`/urls/${shortURL}`);
});

//URLS_NEW
app.get("/urls/new", (req, res) => {
  const currentUserID = req.session.user_id;
  let templateVars = {
    user: users[currentUserID]
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//URLS_SHOW
app.get("/urls/:shortURL", (req, res) => {
  const currentUserID = req.session.user_id;
  const shortURL = req.params.shortURL;
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: users[currentUserID]
  };
  const newDatabase = urlsForUser.urlsForUser(currentUserID, urlDatabase);
  if (req.session.user_id === newDatabase[shortURL]['userID']) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Please login or register');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (req.session.user_id) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  if (req.session.user_id === urlDatabase[shortURL]['userID']) {
    urlDatabase[shortURL] = {}; //store new URLs in urlDatabase
    urlDatabase[shortURL]['longURL'] = req.body.editURL;
    urlDatabase[shortURL]['userID'] = req.session.user_id;
    res.redirect(`/urls`);
  } else {
    res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL]['userID']) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  let templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL]['longURL'],
    user: users[req.session.user_id]
  };
  res.render(`urls_show`, templateVars);
});

//URLS_LOGIN
app.get("/login", (req, res) => {
  const currentUserID = req.session.user_id;
  let templateVars = {
    user: users[currentUserID]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailExists.emailExists(email, users);
  const userFromEmail = findIdByEmail.findIdByEmail(email, users);
  if (user === undefined) {
    res.status(403).send('No registration for this email');
  }
  if (userFromEmail === undefined) {
    res.status(403).send('Invalid email');
  }
  if (bcrypt.compareSync(password, users[userFromEmail]['password'])) {
    // eslint-disable-next-line camelcase
    req.session.user_id = user['id'];
    res.redirect("/urls");
  } else {
    res.status(403).send('Invalid password');
  }
});

//URLS_REGISTER
app.get("/register", (req, res) => {
  const currentUserID = req.session.user_id;
  let templateVars = {
    user: users[currentUserID]
  };
  if (!req.session.user_id) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString.generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = id;

  if (email === "" || password === "") {
    res.status(400).send('Missing email or password');
  } else if (emailExists.emailExists(email, users)) {
    res.status(400).send('Email already registered');
  } else {
    users[newUser] = {};
    users[newUser]['id'] = id;
    users[newUser]['email'] = email;
    users[newUser]['password'] = hashedPassword;
  }
  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});