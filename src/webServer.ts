import express from "express";
import router from "./routes";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const port: number = parseInt(process.env.PORT ?? "3000");
const server = express();

export async function createWebServer() {
  server.use(express.json());

  // get chats
  server.use("/api", router);
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
    console.log(`!!WebServer Started!!`);
  });
  return server;
}

export default server;
