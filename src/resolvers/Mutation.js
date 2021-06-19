const bcrypt = require("bcryptjs");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("../tokenManip");

async function changeTaskStatus(parent, args, context, info) {
  try {
    const { id, status, dashboard } = args;
    const { prisma, userId } = context;
    try {
      const { creator_id } = await prisma.dashboards.findUnique({
        where: {
          id: dashboard,
        },
      });
      const { assigned_to_id, dashboard_belonging_to_id } =
        await prisma.tasks.findUnique({
          where: {
            id: id,
          },
        });
      if (dashboard !== dashboard_belonging_to_id) {
        throw new Error("Task not present in this dashboard");
      }
      if (creator_id !== userId && assigned_to_id !== userId) {
        throw new Error("You cannot edit tasks for others in this dashboard");
      }

      if (!isNaN(userId)) {
        return await prisma.tasks.update({
          where: {
            id: id,
          },
          data: {
            status,
          },
          include: {
            created_by: true,
            assigned_to: true,
            dashboard_belonging_to: true,
          },
        });
      } else throw new Error(userId);
    } catch (err) {
      throw new Error(
        err.message ===
        "Cannot destructure property 'creator_id' of '(intermediate value)' as it is null."
          ? "Dashboard ID is wrong"
          : err.message ===
            "Cannot destructure property 'assigned_to_id' of '(intermediate value)' as it is null."
          ? "Task not Found"
          : err.message
      );
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

async function createTask(parent, args, context, info) {
  try {
    const { name, description, assignTo, dashboard } = args;
    const { prisma, userId } = context;
    const response = await prisma.dashboards.findUnique({
      where: {
        id: dashboard,
      },
      include: {
        members: true,
      },
    });
    if (!response.members.some((item) => item.id === assignTo)) {
      throw new Error("User not present in Dashboard");
    }
    if (!response) {
      throw new Error("Dashboard not present");
    }
    if (response.creator_id !== userId && assignTo !== userId) {
      throw new Error("You cannot create tasks for others in this dashboard");
    }
    if (!isNaN(userId)) {
      return await prisma.tasks.create({
        data: {
          name: name,
          description: description,
          status: 1,
          created_by: { connect: { id: userId } },
          assigned_to: { connect: { id: assignTo } },
          dashboard_belonging_to: { connect: { id: dashboard } },
        },
        include: {
          created_by: true,
          assigned_to: true,
          dashboard_belonging_to: true,
        },
      });
    } else throw new Error(userId);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function deleteTask(parent, args, context, info) {
  try {
    const { id, dashboard } = args;
    const { prisma, userId } = context;

    try {
      const { creator_id } = await prisma.dashboards.findUnique({
        where: {
          id: dashboard,
        },
      });
      const { assigned_to_id, dashboard_belonging_to_id } =
        await prisma.tasks.findUnique({
          where: {
            id: id,
          },
        });
      if (creator_id !== userId && assigned_to_id !== userId) {
        throw new Error("You cannot delete tasks for others in this dashboard");
      }
      if (dashboard !== dashboard_belonging_to_id) {
        throw new Error("Task not present in this dashboard");
      }
    } catch (err) {
      throw new Error(
        err.message ===
        "Cannot destructure property 'creator_id' of '(intermediate value)' as it is null."
          ? "Dashboard ID is wrong"
          : err.message ===
            "Cannot destructure property 'assigned_to_id' of '(intermediate value)' as it is null."
          ? "Task not Found"
          : err.message
      );
    }

    if (!isNaN(userId)) {
      return await prisma.tasks.delete({
        where: {
          id: id,
        },
        include: {
          created_by: true,
          assigned_to: true,
          dashboard_belonging_to: true,
        },
      });
    } else throw new Error(userId);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function editTask(parent, args, context, info) {
  try {
    const { id, name, description, dashboard } = args;
    const { prisma, userId } = context;

    try {
      const { creator_id } = await prisma.dashboards.findUnique({
        where: {
          id: dashboard,
        },
      });
      const { assigned_to_id, dashboard_belonging_to_id } =
        await prisma.tasks.findUnique({
          where: {
            id: id,
          },
        });
      if (dashboard !== dashboard_belonging_to_id) {
        throw new Error("Task not present in this dashboard");
      }
      if (creator_id !== userId && assigned_to_id !== userId) {
        throw new Error("You cannot edit tasks for others in this dashboard");
      }
    } catch (err) {
      throw new Error(
        err.message ===
        "Cannot destructure property 'creator_id' of '(intermediate value)' as it is null."
          ? "Dashboard ID is wrong"
          : err.message ===
            "Cannot destructure property 'assigned_to_id' of '(intermediate value)' as it is null."
          ? "Task not Found"
          : err.message
      );
    }

    if (!isNaN(userId)) {
      return await prisma.tasks.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          description: description,
        },
        include: {
          created_by: true,
          assigned_to: true,
          dashboard_belonging_to: true,
        },
      });
    } else throw new Error(userId);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function addMembersToDashboard(parent, args, context, info) {
  try {
    const { prisma, userId } = context;

    if (!isNaN(userId)) {
      const dashboard = await prisma.dashboards.findUnique({
        where: {
          id: args.id,
        },
      });
      const memberId = await prisma.users.findUnique({
        where: {
          id: args.memberId,
        },
      });
      if (!memberId) {
        throw new Error("Member not found");
      }
      if (!dashboard) {
        throw new Error("No dashboard available");
      }
      const { members } = await prisma.dashboards.findUnique({
        where: {
          id: args.id,
        },
        include: {
          members: true,
        },
      });
      if (members.some((member) => member.id === args.memberId)) {
        throw new Error("Member already present");
      }
      if (dashboard.creator_id !== userId) {
        throw new Error(
          "You don't have permission to add members to this dashboard"
        );
      }

      try {
        return await prisma.dashboards.update({
          where: {
            id: args.id,
          },
          data: {
            members: { connect: { id: args.memberId } },
          },
          include: {
            members: true,
          },
        });
      } catch (err) {
        throw new Error(err.message);
      }
    } else throw new Error(userId);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function removeMembersFromDashboard(parent, args, context, info) {
  try {
    const { prisma, userId } = context;

    if (!isNaN(userId)) {
      const dashboard = await prisma.dashboards.findUnique({
        where: {
          id: args.id,
        },
      });
      const memberId = await prisma.users.findUnique({
        where: {
          id: args.memberId,
        },
      });
      if (!memberId) {
        throw new Error("Member not found");
      }
      if (!dashboard) {
        throw new Error("No dashboard available");
      }
      const { members } = await prisma.dashboards.findUnique({
        where: {
          id: args.id,
        },
        include: {
          members: true,
        },
      });
      let flag = false;
      if (members.some((member) => member.id === args.memberId)) {
        flag = true;
      }
      if (flag === false) {
        throw new Error("Member not present in dashboard");
      }
      if (dashboard.creator_id !== userId) {
        throw new Error(
          "You don't have permission to remove members from this dashboard"
        );
      }

      try {
        return await prisma.dashboards.update({
          where: {
            id: args.id,
          },
          data: {
            members: { disconnect: { id: args.memberId } },
          },
          include: {
            members: true,
          },
        });
      } catch (err) {
        throw new Error(err.message);
      }
    } else throw new Error(userId);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function createDashboard(parent, args, context, info) {
  try {
    const { prisma, userId } = context;
    if (!isNaN(userId)) {
      try {
        return await prisma.dashboards.create({
          data: {
            name: args.name,
            description: args.description,
            members: { connect: { id: userId } },
            creator: { connect: { id: userId } },
          },
          include: {
            creator: true,
            members: true,
          },
        });
      } catch (err) {
        throw new Error(err.message);
      }
    } else throw new Error(userId);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function editDashboard(parent, args, context, info) {
  try {
    const { prisma, userId } = context;
    const dashboard = await prisma.dashboards.findUnique({
      where: {
        id: args.id,
      },
    });
    if (!dashboard || dashboard.creator_id !== userId) {
      throw new Error("You don't have permission to edit this dashboard");
    }
    if (!isNaN(userId)) {
      try {
        return await prisma.dashboards.update({
          where: {
            id: args.id,
          },
          data: {
            name: args.name,
            description: args.description,
          },
          include: {
            creator: true,
          },
        });
      } catch (e) {
        throw new Error(e.message);
      }
    } else throw new Error(userId);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function deleteDashboard(parent, args, context, info) {
  try {
    const { prisma, userId } = context;
    const dashboard = await prisma.dashboards.findUnique({
      where: {
        id: args.id,
      },
    });
    if (!dashboard || dashboard.creator_id !== userId) {
      throw new Error("You don't have permission to delete this dashboard");
    }
    //   if (!isNaN(userId)) {
    //     try {
    //       return await prisma.dashboards.delete({
    //         where: {
    //           id: args.id,
    //         },
    //         include: {
    //           creator: true,
    //         },
    //       });
    //     } catch (err) {
    //       throw new Error(err.message);
    //     }
    //   } else throw new Error(userId);
    // } catch (error) {
    //   throw new Error(error.message);
    // }
    if (!isNaN(userId)) {
      try {
        const result =
          await prisma.$executeRaw`DELETE FROM dashboards WHERE id=${args.id};`;
        if (result === 1) return args.id;
        else return 0;
      } catch (err) {
        throw new Error(err.message);
      }
    } else throw new Error(userId);
  } catch (error) {
    throw new Error(error.message);
  }
}

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
  changeTaskStatus,
  createTask,
  deleteTask,
  editTask,
  addMembersToDashboard,
  removeMembersFromDashboard,
  createDashboard,
  editDashboard,
  deleteDashboard,
  signup,
  login,
  logout,
  revokeRefreshTokensForUser,
};
