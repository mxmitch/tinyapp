const {
  assert
} = require('chai');

const {
  findIdByEmail
} = require('../helpers.js');

const testUsers = {
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

describe('findIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findIdByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert(user === expectedOutput);
  });
  it('should return undefined when email doesn\'t exist', function() {
    const user = findIdByEmail("user69@example.com", testUsers);
    const expectedOutput = undefined;
    assert(user === expectedOutput, 'email is not found');
  });
});