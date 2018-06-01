const { ObjectID } = require('mongodb'),
      { Todo } = require('../../models//todo'),
      { User } = require('../../models/user'),
      jwt = require('jsonwebtoken');

const userIdOne = new ObjectID(),
      userIdTwo = new ObjectID();

const todoList = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userIdOne
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 123,
    _creator: userIdTwo
  }
];

const userList = [
  {
    _id: userIdOne,
    email: 'userOne@email.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({_id: userIdOne, access: 'auth'}, process.env.JWT_SECRET)
      }
    ]
  },
  {
    _id: userIdTwo,
    email: 'userTwo@email.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({_id: userIdTwo, access: 'auth'}, process.env.JWT_SECRET)
      }
    ]
  }
]

const populateTodos = done => {
  Todo.remove({})
    .then(() => Todo.insertMany(todoList))
    .then(() => done());
};

const populateUsers = done => {
  User.remove({})
    .then(() => {
      var userOne = new User(userList[0]).save(),
          userTwo = new User(userList[1]).save();

      return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = { todoList, populateTodos, userList, populateUsers };
