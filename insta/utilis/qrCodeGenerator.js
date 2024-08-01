let QRCode = require('qrcode');
let generateQR = async (data) => {
  try {
    // console.log(req.body);
    //it requires string
    let dataString = JSON.stringify(data);
    let url = await QRCode.toDataURL(dataString);
    // console.log('Generated QR Code URL:', url);
    // console.log(url);
    return url; //@html <img src=">"
  } catch (err) {
    console.error(err);
  }
};
module.exports = { generateQR };
