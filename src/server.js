import Express from "express";
import listEndpoints from "express-list-endpoints";

import cors from "cors";
import {
  badRequestErrorHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import UsersRouter from "./api/users/index.js";
import PostsRouter from "./api/posts/index.js";
import UsersFileRouter from "./api/File/UsersFileRouter.js";
import PostsFileRouter from "./api/File/PostFileRouter.js";
import ExperiencesRouter from "./api/experiences/index.js";
import ExperienceFileRouter from "./api/File/ExperienceFileRouter.js";
import commentRouter from "./api/Comments/index.js";
import pdfFileRouter from "./api/File/pdfFileRouter.js";
import createHttpError from "http-errors";
import { pgConnect } from "./db.js";

const server = Express();
const port = process.env.PORT;
server.use(Express.json());

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOpt = {
  origin: (currentOrigin, corsNext) => {
    if (!currentOrigin || whiteList.indexOf(currentOrigin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `Origin ${currentOrigin} is not in the whitelist!`)
      );
    }
  },
};

server.use(cors(corsOpt));

server.use("/api", UsersRouter);
server.use("/api", ExperiencesRouter);
server.use("/api", PostsRouter);
server.use("/api", UsersFileRouter);
server.use("/api", ExperienceFileRouter);
server.use("/api", PostsFileRouter);
server.use("/api", commentRouter);
server.use("/api", pdfFileRouter);

server.use(badRequestErrorHandler);

server.use(notFoundHandler);
server.use(genericErrorHandler);
await pgConnect();

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${port}`);
});
