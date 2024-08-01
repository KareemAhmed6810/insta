const { app } = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
(async function connection() {
	try
  {  await mongoose.connect(`${process.env.DATABASE_LOCAL}`);
    console.log('Connected succfully');}
	catch(err){
		console.log(`ERROR OCCURED ${err}`)

	}
  })();
  const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Running on ${port}`);
});
