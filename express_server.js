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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "1234"
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
  for (const item in users) {
    if (users[item]['email'] === email) {
      return users[item];
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let newObject = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      console.log(urlDatabase[item]);
      newObject[item] = urlDatabase[item];
    }
  }
  return newObject;
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
  const currentUserID = req.cookies['user_id'];
  const newDatabase = urlsForUser(currentUserID);
  console.log('this is the getURL', users[currentUserID]);
  console.log(req.cookies);
  let templateVars = { urls: newDatabase, user: users[currentUserID] };
  console.log("this is user", users);
  if (!req.cookies['user_id']) {
    res.status(403).send('Please login or register');
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL",(req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase };
  const currentUserID = req.cookies['user_id'];
  const newDatabase = urlsForUser(currentUserID);
  if (newDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Please login or register');
  }
    
  // [req.params.shortURL]['longURL'], user: users[req.cookies['user_id']] };

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
  urlDatabase[shortURL] = {}; //store new URLs in urlDatabase
  urlDatabase[shortURL]['longURL'] = req.body['longURL'];
  urlDatabase[shortURL]['userID'] = req.cookies['user_id'];
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.render(`urls_show`, {shortURL,longURL: urlDatabase[shortURL].longURL,user: req.cookies["user_id"]});
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const user = emailExists(email);
  console.log(user);

  if (!user) {
    res.status(403).send('No registration for this email');
  }
  if (password === user.password) {
    res.cookie("user_id",user['id']);
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
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});