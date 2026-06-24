import autController from "../../modules/auth/auth.controller.js";
import express from "express";
import globalHandleMiddleWare from "../../middleWares/globalErr.MidlleWare.js";
import { BUCKET_NAME, SERVER_PORT } from "../../config/config.service.js";
import testConnection from "../../DB/connection.js";
import testRedisConnection from "../../DB/redis/redis.connection.js";
import userController from "../../modules/user/user.controller.js";
import cors from "cors";
import S3BucketService from "../S3BUCKET/s3Bucket.service.js";
import succResponse from "../response/succ.response.js";
import postController from "../../modules/posts/posts.controller.js";
import commentController from "../../modules/comment/comment.controller.js";
import { createHandler } from "graphql-http/lib/use/express";
import schema from "../../modules/gql/schema.gql.js";
import RealtimeGateway from "../../modules/realTime/realTime.getway.js";
import chatController from "../../modules/chat/chat.controller.js";




async function bootstrap() {
  const app: express.Express = express()
  const PORT = SERVER_PORT || 5000
  app.use(express.json())
  app.use(cors())
  await testConnection();
  await testRedisConnection();

  const s3BucketService = new S3BucketService();

  app.get(
    "/", (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      res.status(200).json({ message: "landing page" });
    }
  );



  app.all("/graphql", createHandler({
    schema: schema, context: (req) => ({
      user: req.raw.user,
      tokenPayload: req.raw.tokenPayload
    })
  }));


  app.use("/auth", autController)
  app.use("/user", userController)
  app.use("/post", postController)
  app.use("/comment", commentController)
  app.use("/chat", chatController)




  app.get("/preSignedUpload/*path", async (req, res, next) => {
    const path = decodeURIComponent(req.params.path.join("/"));
    const { fileName, download } = req.query;
    try {
      const key = decodeURIComponent(path);

      const result = await s3BucketService.createPresignedgetFile({
        fileName: fileName as string,
        download: download === "true",
        Key: key,
      });
      return succResponse({ res, msg: "File URL generated successfully", data: { url: result } });

      // if (!result.Body) {
      //   return res.status(404).json({ message: "File not found" });
      // }

      // if (result.ContentType) {
      //   res.setHeader("Content-Type", result.ContentType);
      // }


      //     const pipelinePromise = promisify(pipeline);

      // if (download === "true") {
      //       res.setHeader("Content-Disposition", `attachment; filename="${fileName || key.split("/").pop()}"`);
      //     }
      //     await pipelinePromise(result.Body as NodeJS.ReadableStream, res);

    } catch (error) {
      next(error);
    }
  });



  app.post("/send-notification", async (req, res, next) => {

    return succResponse({ res, msg: "Notification sent successfully", data: { notification: "This is a test notification" } });
  }
  );






  app.use(
    "/*dummy", (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      res.status(404).json({ message: "Hello World from Express and TypeScript!" });
    }
  );


  app.use(
    globalHandleMiddleWare
  );



  const tabId: string[] = []

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })


RealtimeGateway.initializeIo(server)




}

export default bootstrap;