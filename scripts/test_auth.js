const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

const home = require('os').homedir();
const configPath = path.join(home, '.config', 'configstore', 'firebase-tools.json');

if (!fs.existsSync(configPath)) {
  console.error("firebase-tools.json not found.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const tokens = config.tokens;

const db = new Firestore({
  projectId: 'taskmaster-todo-8e733',
  credentials: {
    type: 'authorized_user',
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'VQuieP3gKa0xlic12S74ZgZ_',
    refresh_token: tokens.refresh_token
  }
});

async function run() {
  const collections = await db.listCollections();
  console.log("Collections:", collections.map(c => c.id));
}

run().catch(console.error);
