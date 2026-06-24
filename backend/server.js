const app = require('./src/app');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load default .env with override to prevent stuck terminal variables
require('dotenv').config({ override: true });

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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(async (err) => {
    console.error(`❌ Failed to connect to MongoDB at ${dbUri}`);
    console.error(err.message);
    
    // Auto Fallback logic
    const localUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/hallobarbershop';
    if (dbUri !== localUri) {
        console.log('⚠️ Đang thử chuyển sang MongoDB LOCAL (Fallback)...');
        try {
            await mongoose.connect(localUri);
            console.log('✅ Connected to MongoDB LOCAL successfully (Fallback)');
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        } catch (fallbackErr) {
            console.error('❌ Mọi nỗ lực kết nối tới MongoDB đều thất bại!');
            console.error(fallbackErr);
            process.exit(1);
        }
    } else {
        process.exit(1);
    }
  });