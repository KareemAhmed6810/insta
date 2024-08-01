const fs = require('fs');
const path = require('path');
const { createInvoice } = require('./pdf');
const { sendEmail } = require('../utilis/email');
const { generateQR } = require('../utilis/qrCodeGenerator');
const { User } = require('../models/userModel');
const { cronJob } = require('../utilis/TaskSchedule');
const multer = require('multer');
const sharp = require('sharp');
function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();

  return `${day}_${month}_${year}`;
}

exports.getPdf = async function(req, res, next) {
  try {
    //   console.log(myPath);
    // createInvoice(invoice,path);
    console.log(Date.now());
    const invoice = {
      shipping: {
        name: req.user.userName,
        gender: req.user.gender,
        age: req.user.age,
        address: '1234 Main Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        postal_code: 94111
      },
      items: [
        {
          item: 'TC 100',
          description: 'Toner Cartridge',
          quantity: 2,
          amount: 6000
        },
        {
          item: 'USB_EXT',
          description: 'USB Cable Extender',
          quantity: 1,
          amount: 2000
        }
      ],
      subtotal: 8000,
      paid: 0,
      invoice_nr: 1234,
      date: '2023-01-01'
    };
    const myPath = path.join(__dirname, '../public');
    console.log('the path   ', myPath);
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    let PdfName = `${req.user._id}_${formattedDate}.pdf`;
    // Ensure the directory exists
    let filePath = myPath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    filePath = path.join(myPath, PdfName);

    createInvoice(invoice, filePath);
    console.log('CREATED SUCCFULLLLLLLLLLLLLLLLY', filePath);
    await sendEmail(
      req.user.email,
      'all data are included',
      'here is your pdf with all the details',
      [
        {
          filename: PdfName,
          path: filePath,
          contentType: 'application/pdf'
        }
      ]
    );
    res.status(200).json({ msg: 'done' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
exports.shareProfile = async function(req, res, next) {
  let { email, userName } = req.user;
  let data = { email, userName };
  let url = await generateQR(data);
  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    { shareProfileLink: url },
    { new: true }
  );
  let jj = cronJob;
  jj.start();
  res.status(200).json({ updateUser, url });
};

const multerStorage = multer.memoryStorage();
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
  console.log(__dirname);
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

exports.editProfilePic = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ message: 'No files found' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { profilePic: req.files[0].filename } // Store the filename or URL, not the file buffer
    );

    if (user) {
      res.status(200).json({
        message: 'Profile picture updated',
        user,
        img: req.files[0].filename
      });
    } else {
      res.status(400).json({ message: 'Invalid user' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};
