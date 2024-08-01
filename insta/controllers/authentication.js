const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utilis/email');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { User } = require('../models/userModel');
const { appError } = require('../utilis/appError');
const { generateQR } = require('../utilis/qrCodeGenerator');

function createToken(id, t) {
  // let waiting = t || process.env.JWT_EXPIRES_IN;
  let waiting = process.env.JWT_EXPIRES_IN;
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: waiting
  });
}

exports.resendConfirmationMail = async function(req, res, next) {
  const { token } = req.params;
  if (!token) res.status(400).json({ msg: 'error' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // b3ml check henaaa
  const user = await User.findOne({
    _id: decoded.id,
    emailConfirmation: false
  });
  if (user) {
    let token = createToken(user._id, 120);
    let refreshToken = createToken(user._id);
    //hash password at the schema

    //send mail to check (destination,subject,msg)
    let msg = `<a href="${req.protocol}://${req.headers.host}/user/confirm/${token}">click heree</a>
  <br>
   <a href="${req.protocol}://${req.headers.host}/user/emailResend/${refreshToken}">if time expires click re send activation link</a> `;

    await sendEmail(user.email, 'confirmation mail', msg);

    res.status(200).json({ msg: 'confirmed RECHECK' });
  } else res.status(400).json({ msg: 'invalid link' });
};
exports.signUp = async function(req, res, next) {
  // try {
  //check input
  let { userName, email, password, passwordConfirm, age } = req.body;
  const user = await User.findOne({ email });
  if (user) res.json({ msg: 'user already exisgt' });
  if(req.file)
  {
    
  }
  const newUser = await User.create({
    userName,
    email,
    password,
    passwordConfirm,
    age
  });

  //create jwt
  let token = createToken(newUser._id, 45);
  let refreshToken = createToken(newUser._id);
  //hash password at the schema

  //send mail to check (destination,subject,msg)
  let msg = `<a href="${req.protocol}://${req.headers.host}/user/confirm/${token}">click heree</a>
  <br>
   <a href="${req.protocol}://${req.headers.host}/user/emailResend/${refreshToken}">if time expires click re send activation link</a> `;
  console.log('hereeeeeeee');
  await sendEmail(email, 'confirmation mail', msg);

  let url = await generateQR(req, res);
  res.status(200).json({ newUser, token, url });
  // } catch (err) {
  //   console.log(`error from signUp`, err);
  //   res.status(500).json({
  //     msg: 'signUp Error',
  //     err
  //   });
  // }
};
exports.confirmEmail = async function(req, res, next) {
  try {
    const { token } = req.params;
    if (!token) res.status(400).json({ msg: 'error' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(
      { _id: decoded.id, emailConfirmation: false },
      { emailConfirmation: true },
      {
        //return for me the user after update
        new: true,
        //check valdiators
        runValidators: true
      }
    );
    if (user) res.status(200).json({ msg: 'confirmed please log in' });
    else res.status(400).json({ msg: 'invalid log in' });
  } catch (error) {
    res.status(500).json({ msg: 'error', error });
  }
};
exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    res.status(400).json({ msg: 'u must add email and passsword' });
  else {
    let user = await User.findOne({ email });
    let check = user.checkPass(password, user.password);
    let token = createToken(user._id);
    if (check) {
      res.status(200).json({ msg: 'logged in succfully', token });
    }
  }
};
exports.protection = async function(req, res, next) {
  try {

    let token;
    //check headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      if (!token) res.status(500).json({ msg: 'invalid token' });
      else {
        // console.log('valid token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById({ _id: decoded.id }).select(
          '-password'
        );
        if (!user) res.status(400).json({ msg: 'in-valid token data' });
        else {
          //check if the user changed his passwordafter
          if (user.changedPasswordAfter(decoded.iat)) {
            res.status(400).json({ msg: 'user has changed the password' });
          } else {
            // console.log(user);
            req.user = user;
            next();
          }
        }
      }
    }
  } catch (error) {
    res.status(200).json({ error });
  }
};
//any number of roles
exports.restrictTo = function(...roles) {
  return (req, res, next) => {
    //authentication then authorizartion
    if (!roles.includes(req.user.role))
      res.status(400).json({ msg: 'user has no uathority for thisss' });

    next();
  };
};
exports.logInWithGoogle = async function(req, res, next) {
  //1 npm i google-auth-library
  //2 require and calling
  //3
  const { name, firstName, lastNane, response, photoUrl } = req.body;
  const idToken = response.id_token;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then(async response => {
      //email verified a check en fe mail in gmail afrd b3t hamada@hamada.com
      const { email, email_verified } = response.payload;
      if (email_verified) {
        //if mail is found in my DB adkhlo law laa a3mlo signUp
        const user = await User.findOne({ email });
        if (user) {
          let token = createToken(user._id);
          res.status(200).json({ msg: 'welcome', token });
        } else {
          //first make password not required
          //h3mlo inser mesh ha3ml dot save we
          const newUser = await User.insertMany({
            userName: name,
            email,
            emailConfirmation: true
          });
          let token = createToken(newUser._id);
          res.status(200).json({ msg: 'welcome', token });
        }
      }
    });
};
