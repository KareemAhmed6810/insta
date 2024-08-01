const express = require('express');

const router = express.Router();
const authentication = require('../controllers/authentication');
const postController = require('../controllers/postController');
router.post(
  '/',
  authentication.protection,
  postController.uploadUserPhoto,
  postController.resizeUserPhoto,
  postController.createPost
);
router.get('/:id', authentication.protection, postController.getPost);

router.patch('/like/:id', authentication.protection, postController.likePost);
router.patch(
  '/:id/comment',
  authentication.protection,
  postController.createComment
);
module.exports = router;
