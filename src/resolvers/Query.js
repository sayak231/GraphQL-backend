async function feed(_, _, context, _) {
  return await context.prisma.users.findMany();
}

async function me(_, _, context, _) {
  if (!context.userId) {
    throw new Error("You are not authenticated!");
  }

  // user is authenticated
  return await context.prisma.users.findUnique({
    where: {
      id: context.userId,
    },
  });
}

async function protected(_, _, context, _) {
  if (!context.userId) {
    throw new Error("You are not authenticated!");
  }
  return await context.prisma.users.findUnique({
    where: {
      id: context.userId,
    },
  });
}

module.exports = {
  feed,
  me,
  protected,
};
