const { ObjectID } = require('mongodb'),
      { mongoose } = require('../server/db/mongoose'),
      { Todo } = require('../server/models/todo');

// Removes all todos
Todo.remove({}).then(result => console.log(result));

// Removes a todo and returns removed doc
Todo.findOneAndRemove({_id: '5b09161964d8ef9cf27f1a67'}).then(result => console.log(result));

Todo.findByIdAndRemove('5b09161964d8ef9cf27f1a67').then(result => console.log(result));
