const bcrypt = require("bcryptjs");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("../tokenManip");

async function signup(_, args, context, _) {
  const getUser = await context.prisma.users.findUnique({
    where: { email: args.email },
  });
  if (getUser) {
    throw new Error("User already exists");
  }
  const password = await bcrypt.hash(args.password, 10);

  try {
    const user = await context.prisma.users.create({
      data: { ...args, password },
    });
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
}

async function login(_, args, context, _) {
  const user = await context.prisma.users.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new Error("No such user found");
  }
  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  // access token
  const accessToken = createAccessToken(user);
  // refresh token
  const refreshToken = createRefreshToken(user);

  //refresh token going to cookie
  sendRefreshToken(context.res, refreshToken);

  return {
    accessToken,
    user,
  };
}

async function logout(_, _, context, _) {
  sendRefreshToken(context.res, "");

  return true;
}

async function revokeRefreshTokensForUser(_, args, context, _) {
  const user = await context.prisma.users.findUnique({
    where: {
      id: args.userId,
    },
  });
  const updateUser = await context.prisma.users.update({
    where: { id: args.userId },
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
  });

  return true;
}

module.exports = {
  signup,
  login,
  logout,
  revokeRefreshTokensForUser,
};
