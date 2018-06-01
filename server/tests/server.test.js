const expect = require('expect'),
      request = require('supertest'),
      { ObjectID } = require('mongodb'),
      { app } = require('../server'),
      { Todo } = require('../models/todo'),
      { User } = require('../models/user'),
      { todoList, userList, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a todo', done => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', userList[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) { return done(err) };

        Todo.find({text})
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(err => done(err));
      })
  });

  it('should not create a todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', userList[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', userList[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todos.length).toBe(1))
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todoList[0]._id.toHexString()}`)
      .set('x-auth', userList[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todo.text).toBe(todoList[0].text))
      .end(done);
  });

  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todoList[1]._id.toHexString()}`)
      .set('x-auth', userList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', userList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .set('x-auth', userList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    var hexId = todoList[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', userList[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todo._id).toBe(hexId))
      .end((err, res) => {
        if (err) { return done(err); }

        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should not remove a todo created by other user', done => {
    var hexId = todoList[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', userList[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) { return done(err); }

        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toExist();
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should return 404 if todo not found', done => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', userList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', done => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', userList[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    var hexId = todoList[0]._id.toHexString(),
        body = {
          text: 'Something to do',
          completed: true
        };

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', userList[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should not update the todo created by other user', done => {
    var hexId = todoList[1]._id.toHexString(),
        body = {
          text: 'Something to do',
          completed: true
        };

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', userList[0].tokens[0].token)
      .send(body)
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', done => {
    var hexId = todoList[1]._id.toHexString(),
        body = {
          text: 'Something to do',
          completed: false
        };

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', userList[1].tokens[0].token)
      .send(body)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', userList[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(userList[0]._id.toHexString());
        expect(res.body.email).toBe(userList[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => expect(res.body).toEqual({}))
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    var email = 'email@email.com',
        password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) { return done(err); }

        User.findOne({email})
          .then(user => {
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should return validation errors if request invalid', done => {
    var email = 'email',
        password = '123';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', done => {
    var email = userList[0].email,
        password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/users/login')
      .send({
        email: userList[1].email,
        password: userList[1].password
      })
      .expect(200)
      .expect(res => expect(res.headers['x-auth']).toExist())
      .end((err, res) => {
        if (err) { return done(err); }

        User.findById(userList[1]._id)
          .then(user => {
            expect(user.tokens[1]).toInclude({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should reject invalid login', done => {
    request(app)
      .post('/users/login')
      .send({
        email: userList[1].email,
        password: '123abc'
      })
      .expect(400)
      .expect(res => expect(res.headers['x-auth']).toNotExist())
      .end((err, res) => {
        if (err) { return done(err); }

        User.findById(userList[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(1);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe('DELETE /users/logout', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/users/logout')
      .set('x-auth', userList[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) { return done(err); }

        User.findById(userList[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(err => done(err));
      });
  });
});
