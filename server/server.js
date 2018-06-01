require('./config/config');

var express = require('express'),
    bodyParser = require('body-parser'),
    { ObjectID } = require('mongodb'),
    { mongoose } = require('./db/mongoose'),
    { Todo } = require('./models/todo'),
    { User } = require('./models/user'),
    { authenticate } = require('./middlewares/authenticate'),
    bcrypt = require('bcryptjs'),
    port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());

// creates a todo
app.post('/todos', authenticate, (req, res) => {
  var newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  newTodo.save().then(doc => res.send(doc), err => res.status(400).send(err));
});

// gets all todos
app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then(todos => res.send({todos})).catch(err => res.status(400).send(err));
});

// gets a todo
app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) { return res.status(404).send(); }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  })
  .then(todo => {
    if (!todo) { return res.status(404).send(); }
    res.send({todo});
  })
  .catch(err => res.status(400).send());
});

// removes a todo
app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) { return res.status(404).send(); }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
  .then(todo => {
    if (!todo) { res.status(404).send(); }
    res.send({todo});
  })
  .catch(err => res.status(400).send());
});

// updates a todo
app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id,
      body = {};

  req.body.text ? body.text = req.body.text : '';
  req.body.completed ? body.completed = req.body.completed : '';

  if (!ObjectID.isValid(id)) { return res.status(404).send(); }

  if (typeof body.completed === 'boolean' && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true})
    .then(todo => {
      if (!todo) { return res.status(404).send(); }
      res.send({todo});
    })
    .catch(err => res.status(400).send());
});

// creates a user
app.post('/users', (req, res) => {
  var newUser = new User({
    email: req.body.email,
    password: req.body.password
  });

  newUser.save()
    .then(() => newUser.generateAuthToken())
    .then(token => res.header('x-auth', token).send(newUser))
    .catch(err => res.status(400).send(err));
});

// authenticated route
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// logs user in
app.post('/users/login', (req, res) => {
  User.findByCredentials(req.body.email, req.body.password)
    .then(user => {
      return user.generateAuthToken().then(token => res.header('x-auth', token).send(user));
    })
    .catch(err => res.status(400).send());
});

// logs user out
app.delete('/users/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => res.status(200).send(), err => res.status(400).send());
});

app.listen(port, () => {
  console.log('Server is running on port', port);
});

module.exports = { app };
