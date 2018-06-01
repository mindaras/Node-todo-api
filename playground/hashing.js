const { SHA256 } = require('crypto-js');
      jwt = require('jsonwebtoken'),
      bcrypt = require('bcryptjs');

var password = '123abc';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});

var hashedPassword = '$2a$10$XtOkPbYH0xDUaB5K2bL.HuNNETLGPMpKfZpAlpuSbHTByBwk3t4Iy';

bcrypt.compare(password, '$2a$10$XtOkPbYH0xDUaB5K2bL.HuNNETLGPMpKfZpAlpuSbHTByBwk3t4Iy', (err, res) => {
  console.log(res);
});

var data = {
  id: 4
};

// signs a token
var token = jwt.sign(data, 'somesecret');

// decodes a token
var decoded = jwt.verify(token, 'somesecret');

// var message = 'I am user number 3',
//     hash = SHA256(message).toString();
//
// var data = {
//   id: 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
//
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed. Don\'t trust.')
// }
