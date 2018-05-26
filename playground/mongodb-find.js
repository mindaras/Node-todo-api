const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }

  console.log('Connected to MongoDB server');

  const db = client.db('TodoApp');

  db.collection('Todos').find({_id: new ObjectID('5af9d5f571902750155b0c04')}).toArray().then(data => {
    console.log('Todos');
    console.log(JSON.stringify(data, null, 2));
  }, err => console.log('Unable to fetch todos', err));

  db.collection('Todos').find().count((err, count) => {
    if (err) {
      return console.log(err);
    }

    console.log(`Todos count ${count}`);
  });

  db.collection('Users').find({name: 'John'}).toArray().then(data => {
    console.log(JSON.stringify(data, null, 2));
  }, err => console.log(err));

  client.close();
});
