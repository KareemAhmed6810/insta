const mongoose = require('mongoose');
const { commentSchema } = require('./commentModel');
const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String },
    desc: String,
    images: Array,
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);
const Post = new mongoose.model('Post', postSchema);
module.exports = { Post };
