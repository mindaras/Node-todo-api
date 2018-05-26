const { ObjectID } = require('mongodb'),
      { mongoose } = require('../server/db/mongoose'),
      { Todo } = require('../server/models/todo');

const id = '5b019ff5ca5ade0feb265d52';

if (!ObjectID.isValid(id)) { console.log('Not valid id') };

// find returns array
Todo.find({ _id: id }).then(todos => console.log(todos));

// findOne returns object
Todo.findOne({ _id: id }).then(todo => console.log(todo));

// findById returns object
Todo.findById(id).then(todo => console.log('findById', todo));

// handling errors
Todo.findById(id)
  .then(todo => {
    if (!todo) { return console.log('Id not fount') };
    console.log('findById', todo);
  })
  // handles errors like invalid id
  .catch(err => console.log(err));
