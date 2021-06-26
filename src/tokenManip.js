const jwt = require("jsonwebtoken");

const createAccessToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.APP_SECRET, {
    expiresIn: "15m",
  });
};
const createRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
const sendRefreshToken = (res, req, token) => {
  res.cookie("jid", token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    domain: ".herokuapp.com",
    path: "/refresh_token",
    Secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    SameSite: "None",
    withCredentials: true,
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
};
