const jwt = require("jsonwebtoken");

async function protectedRoute(context, returnVal) {
  const user = getUserId(context.req);
  if (user !== "No token found" || user !== "Not authenticated") {
    return await returnVal;
  }
  return user;
}

function getTokenPayload(token) {
  return jwt.verify(token, process.env.APP_SECRET);
}

function getUserId(req, authToken) {
  if (req) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        return "No token found";
      }
      try {
        const { userId } = getTokenPayload(token);
        return userId;
      } catch (err) {
        return err.message;
      }
    }
  } else if (authToken) {
    try {
      const { userId } = getTokenPayload(authToken);
      return userId;
    } catch (err) {
      return err.message;
    }
  }

  return "Not authenticated";
}

module.exports = {
  protectedRoute,
  getUserId,
};
