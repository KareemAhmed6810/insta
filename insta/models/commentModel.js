const mongoose = require('mongoose');
const { replySchema } = require('./replyModel');
const commentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    desc: String,
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reply: [replySchema],
    images: Array,
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: String
  },
  { timestamps: true }
);

const Comment = new mongoose.model('Comment', commentSchema);
module.exports = { Comment, commentSchema };
