const app = require('./src/app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hallobarbershop')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });