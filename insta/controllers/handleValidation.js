const { validationResult } = require('express-validator');

exports.handleValidationFunction = function(req, res, next) {
  try {
        console.log('ssssss');

    //validation Result is inside express-validator
    const validationError = validationResult(req);
    if (validationError.isEmpty()) {
      next();
    } else {
      res.json({
        msg: 'validation error from handlevalidatoin',
        error: validationError.errors
      });
    }
  }
   catch (err) {
   res.status(500).json({
     msg: 'Server error',
     error: err.message
   });
  }
};
