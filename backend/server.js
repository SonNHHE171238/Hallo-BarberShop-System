const app = require('./src/app');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load default .env
require('dotenv').config();

// Load local-env/db.env if it exists (overrides default env)
const localDbEnvPath = path.join(__dirname, 'local-env', 'db.env');
if (fs.existsSync(localDbEnvPath)) {
  require('dotenv').config({ path: localDbEnvPath, override: true });
}

const PORT = process.env.PORT || 3000;

// Resolve DB URI based on toggle
let dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hallobarbershop';
if (process.env.USE_LOCAL_DB === 'true') {
    dbUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/hallobarbershop';
    console.log('🔄 Đang kết nối tới MongoDB LOCAL...');
} else if (process.env.USE_LOCAL_DB === 'false' && process.env.MONGO_URI_ATLAS) {
    dbUri = process.env.MONGO_URI_ATLAS;
    console.log('🌐 Đang kết nối tới MongoDB ATLAS...');
}

mongoose.connect(dbUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
  });