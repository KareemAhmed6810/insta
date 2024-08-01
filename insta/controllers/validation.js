const { body } = require('express-validator');

const signUpValidator = [
  body('userName')
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage('invalid username validation'),
  body('email')
    .isEmail()
    .withMessage('invalid email validation'),
  // check if password is strong isStrongPassword()
  body('password')
    .isString() // add appropriate validation for password
    .isLength({ min: 8 }) // example: minimum length of 8 characters
    .withMessage('invalid password validation'),
  body('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('password and password confirm does not match');
    }
    return true;
  })
];

module.exports = { signUpValidator };
