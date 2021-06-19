const jwt = require("jsonwebtoken");

async function getDashboards(parent, args, context, info) {
  try {
    const { prisma, userId } = context;
    if (!isNaN(userId)) {
      const response = await prisma.users.findUnique({
        where: {
          id: userId,
        },
        include: {
          dashboards_present_in: true,
        },
      });
      const newResponse = response.dashboards_present_in.map((item) => {
        return { ...item, isCreated: item.creator_id === userId };
      });
      return newResponse;
    } else throw new Error(userId);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function getDashboardDetails(parent, { id }, context, info) {
  try {
    const { prisma, userId } = context;
    if (!isNaN(userId)) {
      const response = await prisma.dashboards.findUnique({
        where: {
          id,
        },
        include: {
          members: {
            include: {
              tasks_assigned: {
                where: {
                  dashboard_belonging_to_id: id,
                },
              },
            },
          },
          tasks_in_dashboard: true,
        },
      });
      return response;
    } else throw new Error(userId);
  } catch (err) {
    throw new Error(err.message);
  }
}

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
  getDashboards,
  getDashboardDetails,
  feed,
  me,
  protected,
};
