const multer = require('multer');
const sharp = require('sharp');
//Images are stored in memory andnot saved in database we save the path in DB

const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(null, false);
};
const uploadOptions = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.resizeUerPhoto = async function(req, res, next) {
  //to resize the photo we will use it as buffer
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}_${Date.now()}.jpeg `;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
	.toFile(`./../public/img/${req.file.fileName}`);
  next();
};
uploadOptions.array('images'); //req.files

