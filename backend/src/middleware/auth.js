const admin = require('firebase-admin');

console.log('--- Firebase Debug ---');
console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase Admin if credentials are provided
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}
}

/**
 * Middleware to verify Firebase bearer token
 * Expects: Authorization: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - no token provided' });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }
};

module.exports = { verifyToken };
