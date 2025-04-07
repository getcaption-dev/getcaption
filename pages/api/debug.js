// pages/api/debug.js
export default function handler(req, res) {
  res.status(200).json({
    clientId: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    nextauthUrl: process.env.NEXTAUTH_URL,
  });
}