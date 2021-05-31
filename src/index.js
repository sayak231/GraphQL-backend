const { ApolloServer } = require("apollo-server-express");
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "../.env" });

const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const { getUserId } = require("./utils");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("./tokenManip");
(async () => {
  const prisma = new PrismaClient();

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.get("/", (_req, res) => res.send("hello"));
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (err) {
      console.log("rrr", err);
      return res.send({ ok: false, accessToken: "" });
    }

    // token is valid and
    // we can send back an access token
    const user = await prisma.users.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  const resolvers = {
    Query,
    Mutation,
  };

  const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
    resolvers,
    context: ({ req, res }) => ({
      ...req,
      ...res,
      prisma,
      userId: getUserId(req),
    }),
  });

  await server.start();

  server.applyMiddleware({ app, cors: false });

  // server.listen(4000, () => console.log(`Server is running on 4000`));
  await new Promise((resolve) => app.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
})();
