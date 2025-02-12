const admin = require("firebase-admin");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config();

try {
  const serviceAccount = require("../../serviceAccountKey.json");

  if (!serviceAccount.project_id) {
    throw new Error(
      "Invalid service account configuration: missing project_id"
    );
  }

  logger.info("Initializing Firebase Admin", {
    projectId: serviceAccount.project_id,
  });

  // 檢查是否已經初始化
  if (!admin.apps.length) {
    const config = {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://blue-diary-f0e62-default-rtdb.firebaseio.com`,
    };

    admin.initializeApp(config);
    logger.info("Firebase Admin initialized successfully");
  }

  const db = admin.database();
  const auth = admin.auth();

  module.exports = {
    db,
    auth,
    admin,
  };
} catch (error) {
  logger.error("Firebase initialization failed", {
    error: error.message,
    stack: error.stack,
    serviceAccount: {
      projectId: serviceAccount?.project_id,
      clientEmail: serviceAccount?.client_email,
      hasPrivateKey: !!serviceAccount?.private_key,
    },
  });
  throw error;
}
