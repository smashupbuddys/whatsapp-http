import express from "express";
import router from "./routes";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import log from "./lib/logger";

export const port: number = parseInt(process.env.PORT ?? "3000");
const server = express();

export async function createWebServer() {
  server.use(express.json());

  // get chats
  server.use(
    "/api",
    (req, res, next) => {
      const start = Date.now();
      log.http(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        body: req.body ?? undefined,
        query: req.query ?? undefined,
        params: req.params ?? undefined,
      });
      res.on("finish", () => {
        const duration = Date.now() - start;
        log.http(`${req.method} ${req.path} (${duration}ms)`);
      });

      next();
    },
    router
  );
  server.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(
      swaggerjsdoc({
        swaggerDefinition: {
          openapi: "3.0.0",
          info: {
            title: "whatshttp",
            version: "1.0.0",
          },
          servers: [],
        },
        apis: ["./src/routes/*.ts"],
      })
    )
  );

  server.listen(port, () => {
    // Ready
    log.info(`!!WebServer Started!!`);
  });
  return server;
}

export default server;
