const jwt = require("jsonwebtoken");

async function feed(_, _, context, _) {
  return await context.prisma.users.findMany();
}

async function me(_, _, context, _) {
  try {
    const { prisma, userId } = context;
    if (!isNaN(userId)) {
      return await prisma.users.findUnique({
        where: {
          id: userId,
        },
      });
    } else throw new Error(userId);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function protected(_, _, context, _) {
  try {
    const { prisma, userId } = context;
    if (!isNaN(userId)) {
      return await prisma.users.findUnique({
        where: {
          id: userId,
        },
        include: {
          dashboards_created: true,
        },
      });
    } else throw new Error(userId);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  feed,
  me,
  protected,
};
