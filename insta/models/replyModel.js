const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    desc: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    images: Array
  },
  { timestamps: true }
);
const Reply = new mongoose.model('Reply', replySchema);
module.exports = { Reply, replySchema };
