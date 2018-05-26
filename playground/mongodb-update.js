const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }

  console.log('Connected to MongoDB server');

  const db = client.db('TodoApp');

  db.collection('Todos').findOneAndUpdate({
    _id: new ObjectID('5af9d5f571902750155b0c04')
  }, {
    $set: {
      completed: true
    }
  }, {
    returnOriginal: false
  })
    .then(result => console.log(result));

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5afa9777ce16676fb406d0e4')
  }, {
    $inc: {
      age: 3
    }
  }, {
    returnOriginal: false
  })
    .then(result => console.log(result));

  client.close();
});
