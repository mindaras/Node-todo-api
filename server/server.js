require('./config/config');

var express = require('express'),
    bodyParser = require('body-parser'),
    { ObjectID } = require('mongodb'),
    { mongoose } = require('./db/mongoose'),
    { Todo } = require('./models/todo'),
    { User } = require('./models/user'),
    port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());

// create a todo
app.post('/todos', (req, res) => {
  var newTodo = new Todo({text: req.body.text});
  newTodo.save().then(doc => res.send(doc), err => res.status(400).send(err));
});

// get all todos
app.get('/todos', (req, res) => {
  Todo.find().then(todos => res.send({todos})).catch(err => res.status(400).send(err));
});

// get a todo
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) { return res.status(404).send(); }

  Todo.findById(id)
    .then(todo => {
      if (!todo) { return res.status(404).send(); }
      res.send({todo});
    })
    .catch(err => res.status(400).send());
});

// removes a todo
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) { return res.status(404).send(); }

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) { res.status(404).send(); }
      res.send({todo});
    })
    .catch(err => res.status(400).send());
});

// updates a todo
app.patch('/todos/:id', (req, res) => {
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


  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then(todo => {
      if (!todo) { return res.status(404).send(); }
      res.send({todo});
    })
    .catch(err => res.status(400).send());
});

app.listen(port, () => {
  console.log('Server is running on port', port);
});

module.exports = { app };
