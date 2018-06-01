var mongoose = require('mongoose'),
    validator = require('validator'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// determines what is sent back when mongoose model is converted to JSON
UserSchema.methods.toJSON = function() {
  var user = this,
      userObject = user.toObject(); // toObject converts user to object where only the properties available on the document exist

  return {
    _id: userObject._id,
    email: userObject.email
  }
};

// generates, saves and returns a jwt token
UserSchema.methods.generateAuthToken = function() {
  var user = this,
      access = 'auth',
      token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => token);
}

UserSchema.methods.removeToken = function(token) {
  var user = this;

  // removes items from tokens array
  return user.update({
    $pull: {
      tokens: { token }
    }
  });
}

// adds a model method
UserSchema.statics.findByToken = function(token) {
  var User = this,
      decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(err) {
    return Promise.reject(); // invokes catch handler
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;

  return User.findOne({email}).then(user => {
    if (!user) { return Promise.reject(); }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
}

// adds a middleware before save event
UserSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };
