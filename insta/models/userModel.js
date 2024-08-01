const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'PLZ ADD UR USERNAME']
    },
    email: {
      type: String,
      required: [true, 'PLZ ADD UR email'],
      unique: true
    },
    emailConfirmation: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: [true, 'PLZ ADD UR password']
    },
    passwordConfirm: {
      type: String,
      required: [true, 'PLZ ADD UR passwordConfirmation'],
      validate: {
        validator: function(val) {
          return val === this.password;
        }
      }
    },
    gender: {
      type: String,
      default: 'male',
      lowerCase: true,
      enum: ['male', 'female'],
      message: '{VALUE} is not supported'
    },
    age: {
      type: Number,
      required: [true, 'PLZ ADD UR age']
    },
    role: {
      type: String,
      lowerCase: true,
      default: 'user',
      enum: ['user', 'admin', 'manager']
    },

    shareProfileLink: Array,
    profilePic: String,
    coverPic: String,
    socialLinks: Array,
    gallery: Array,
    follower: Array,
    accountStatus: { type: String, default: 'offline' },
    pdfLink: String,
    story: Array,
    passwordChangedAt: {
      type: Date
    }
  },
  { timestamps: true }
);
userSchema.pre('save', async function(next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.SALTROUNDS)
  );
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.checkPass = async function(pass1, pass2) {
  return await bcrypt.compare(pass1, pass2);
};
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  //3mlt field exmo passwordChangedAt
  if (this.passwordChangedAt) {
    //10 is the base number
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = { User };
