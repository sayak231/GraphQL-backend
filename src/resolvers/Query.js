const jwt = require("jsonwebtoken");
const { protectedRoute, getUserId } = require("../utils");

async function getUser(parent, args, context, info) {
  const userID = await getUserId(context.req);
  if (isNaN(userID)) {
    return null;
  }
  const returnVal = await context.prisma.users.findUnique({
    where: {
      id: userID,
    },
    include: {
      dashboards_created: true,
    },
  });
  return protectedRoute(context, returnVal);
}

async function getDashboards(parent, args, context, info) {
  const userID = await getUserId(context.req);
  if (isNaN(userID)) {
    return null;
  }
  const returnVal = await context.prisma.dashboards.findMany({
    where: {
      creator_id: userID,
    },
    include: {
      creator: true,
    },
  });
  return protectedRoute(context, returnVal);
}

async function feed(_, _, context, _) {
  return await context.prisma.users.findMany();
}

async function me(_, _, context, _) {
  if (context.req) {
    try {
      const authHeader = await context.req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        if (!token) {
          return null;
        }
        try {
          const { userId } = jwt.verify(token, process.env.APP_SECRET);
          return await context.prisma.users.findUnique({
            where: {
              id: userId,
            },
          });
        } catch (error) {
          return null;
        }
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  return null;
}

async function protected(_, _, context, _) {
  if (context.req) {
    try {
      const authHeader = await context.req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        if (!token) {
          return null;
        }
        try {
          const { userId } = jwt.verify(token, process.env.APP_SECRET);
          return await context.prisma.users.findUnique({
            where: {
              id: userId,
            },
          });
        } catch (err) {
          return null;
        }
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

module.exports = {
  getUser,
  getDashboards,
  feed,
  me,
  protected,
};
