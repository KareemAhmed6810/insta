const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const app = express();
app.use(express.json());
app.use(morgan('dev'));
//allowed for anyone to access webiste we can add cors option
// app.use(cors());
app.use('/user', userRoutes);
app.use('/post', postRoutes);

module.exports = { app };
