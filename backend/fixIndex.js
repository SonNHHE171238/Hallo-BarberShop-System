const mongoose = require("mongoose");
require("dotenv").config({ override: true });
const fs = require('fs');
const path = require('path');
const localDbEnvPath = path.join(__dirname, 'local-env', 'db.env');
if (fs.existsSync(localDbEnvPath)) {
  require('dotenv').config({ path: localDbEnvPath, override: true });
}
let dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hallobarbershop';
if (process.env.USE_LOCAL_DB === 'true') {
    dbUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/hallobarbershop';
} else if (process.env.USE_LOCAL_DB === 'false' && process.env.MONGO_URI_ATLAS) {
    dbUri = process.env.MONGO_URI_ATLAS;
}
mongoose.connect(dbUri).then(async () => {
  const User = require("./models/user.model");
  try {
    await User.collection.dropIndex("email_1");
    console.log("Index dropped");
  } catch(e) {
    console.log("Index not found", e.message);
  }
  await User.syncIndexes();
  console.log("Indexes synced");
  process.exit(0);
});
