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
    httpOnly: false,
    domain: ".herokuapp.com",
    path: "/refresh_token",
    secure: true,
    SameSite: "None",
    withCredentials: true,
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
};
