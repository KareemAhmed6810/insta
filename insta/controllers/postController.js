const { Post } = require('../models/postModel');
const multer = require('multer');
const sharp = require('sharp');
const { User } = require('../models/userModel');
const { sendEmail } = require('../utilis/email');
const multerStorage = multer.memoryStorage();
const populateList = [
  {
    path: 'userID',
    select: 'email userName '
  },
  {
    path: 'likes',
    select: 'email userName '
  },
  {
    path: 'comment.userID',
    select: 'email userName '
  }
];
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(null, false);
};
const uploadOptions = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.resizeUserPhoto = async function(req, res, next) {
  if (!req.files || req.files.length === 0) return next();
  // Use Promise.all to handle asynchronous operations
  try {
    // Use Promise.all to handle asynchronous operations
    await Promise.all(
      req.files.map(async (file, index) => {
        file.filename = `user-${req.user._id}_${Date.now()}_${index}.jpeg`;
        const filePath = path.join(__dirname, '../public/img', file.filename);
        console.log(filePath);

        await sharp(file.buffer)
          .resize(500, 500)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(filePath);
      })
    );

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error resizing photo:', error);
    res.status(500).json({ message: 'Error processing images', error });
  }
};
exports.uploadUserPhoto = uploadOptions.array('images'); //req.files

exports.createPost = async function(req, res) {
  try {
    let imageUrl = [];
    if (req.files) {
      for (let i = 0; i < req.files.length; ++i) {
        imageUrl.push(req.files[i].filename);
      }
    }

    const { desc, tags } = req.body;
    let tagsEmail = '';
    let validTagIds = [];
    console.log(tags);
    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        const findUser = await User.findOne({ _id: tags[i] }).select('email');
        if (findUser) {
          validTagIds.push(findUser._id);
          if (tagsEmail.length > 0) {
            tagsEmail = tagsEmail + ', ' + findUser.email;
          } else {
            tagsEmail = findUser.email;
          }
        }
      }
    }
    const newPost = new Post({
      desc,
      images: imageUrl,
      userId: req.user._id,
      tags: validTagIds
    });
    const savedPost = await newPost.save();

    console.log(tagsEmail);
    // (dest, sub, msg, attachment)
    if (tagsEmail.length > 0) {
      await sendEmail(
        tagsEmail,
        'tagPost',
        `<p>Hi, you have been mentioned in ${req.user.userName}'s post.</p><br>
        <a href='${req.protocol}://${req.headers.host}/post/${savedPost._id}'>Please click here to see it.</a>`
      );
    }
    console.log('AFTER LOOP');

    res
      .status(201)
      .json({ message: 'Post created successfully', savedPost, status: 201 });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
};
exports.getPost = async function(req, res, next) {
  try {
    const id = req.params.id;
    console.log(id);
    const post = await Post.findById(id);
    console.log('poss');

    if (post) {
      res.status(200).json({
        message: 'Done',
        post,
        status: 200
      });
    } else {
      res.status(400).json({
        message: 'not found',
        status: 400
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'catch err',
      satus: 500
    });
  }
};
exports.likePost = async function(req, res, next) {
  try {
    //id el post
    const id = req.params.id;
    const post = await Post.findById({ id }).populate(populateList);
    if (post) {
      const findUser = post.likes.findById({ _id: req.user._id });
      if (findUser)
        res.status(200).json({ msg: 'user already liked this posrt' });
      else {
        Posts.likes.push(req.user._id);
        await Post.findByIdAndUpdate(
          { id: req.user._id },
          { likes: post.likes }
        );
        res.status(200).json({ msg: 'this post got ur attention' });
      }
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};
exports.createComment = async function(req, res, next) {
  try {
    const { id } = req.params;
    let imageUrl = [];
    if (req.files) {
      for (let i = 0; i < req.files.length; ++i) {
        imageUrl.push(req.files[i].filename);
      }
    }

    const { desc, tags } = req.body;

    let tagsEmail = '';
    let validTagsIDS = [];
    console.log(tagsList);
    for (let i = 0; i < tags.length; i++) {
      console.log('kk');
      const findUser = await User.findOne({ _id: tags[i] }).select('email');
      if (findUser) {
        validTagsIDS.push(findUser._id);
        if (tagsEmail.length > 0) {
          tagsEmail = tagsEmail + ' , ' + findUser.email;
        } else {
          tagsEmail = findUser.email;
        }
      }
    }
    if (!desc) {
      desc = '';
    }

    const post = await postModel.findOne({ _id: id });
    console.log(post);
    if (post) {
      console.log('lol');

      post.comment.push({
        userID: req.user._id,
        desc,
        images: imageURL,
        tags: validTagsIDS
      });
      const updatedPost = await postModel
        .findOneAndUpdate(
          { _id: post._id },
          { comment: post.comment },
          { new: true }
        )
        .populate(populateList);
      await sendEmail(
        tagsEmail,
        'comment',
        `<p> you have mintioned in comment on ${updatedPost.userID.userName} post</p>  <br> 
        <a href='${req.protocol}://${req.headers.host}/post/${updatedPost._id}'> please follow me to see it </a>`
      );
      res.status(200).json({ message: 'Done', updatedPost, sataus: 200 });
    } else {
      res.status(400).json({ message: 'in-valid post', sataus: 400 });
    }

    console.log('desc2');
  } catch (error) {
    res.status(500).json({ error });
  }
};
