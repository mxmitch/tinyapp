const emailExists = function(email, database) {
  for (const user in database) {
    if (database[user]['email'] === email) {
      return database[user];
    }
  }
  return false;
};


const findIdByEmail = function(email, database) {
  let findID = "";
  if (emailExists(email, database)) {
    for (const user in database) {
      if (database[user]['email'] === email) {
        findID = database[user]['id'];
      }
    }
    return findID;
  } else {
    findID = undefined;
    return findID;
  }
};

const generateRandomString = function() {
  let result = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const urlsForUser = function(id, database) {
  let newObject = {};
  for (const item in database) {
    if (database[item].userID === id) {
      newObject[item] = database[item];
    }
  }
  return newObject;
};

module.exports = {
  findIdByEmail,
  emailExists,
  generateRandomString,
  urlsForUser
};