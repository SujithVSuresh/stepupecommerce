const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));


  module.exports = mongoose
