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
const sendRefreshToken = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    path: "/refresh_token",
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
};
