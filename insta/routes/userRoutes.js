const express = require('express');
const handleValidation = require('../controllers/handleValidation');
const { signUpValidator } = require('../controllers/validation');
const authentication = require('../controllers/authentication');
const userController = require('../controllers/userController');
const { generateQR } = require('../utilis/qrCodeGenerator');
const router = express.Router();
router
  .route('/signup')
  .post(
    signUpValidator,
    handleValidation.handleValidationFunction,
    authentication.signUp
  );
router.get('/confirm/:token', authentication.confirmEmail);
router.get('/emailResend/:token', authentication.resendConfirmationMail);
router.post(
  '/signin',
  signUpValidator[(1, 2)],
  handleValidation.handleValidationFunction,
  authentication.signIn
);
router.post('/logInWithGoogle', authentication.logInWithGoogle);
router.get(
  '/profile',
  authentication.protection,
  authentication.restrictTo('admin')
);
router.get('/pdf', authentication.protection, userController.getPdf);
router.get(
  '/shareProfileLink',
  authentication.protection,
  userController.shareProfile
);
router.patch(
  '/updateMe',
  authentication.protection,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.editProfilePic
);

module.exports = router;
