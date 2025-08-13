import migration from "./models/migration";
import sequelize from "./lib/sequelize";
import { createWebServer } from "./webServer";
import { loadClients } from "./whatsapp_api/load";
import log from "./lib/logger";
import fs from "fs";
sequelize
  // Test if database can auth
  .authenticate()
  // Migrate the database
  .then(migration)
  // Delete .wwebjs_cache and .wwebjs_auth
  .then(() => {
    fs.rmdirSync("./.wwebjs_auth", { recursive: true });
    fs.rmdirSync("./.wwebjs_cache", { recursive: true });
  })
  // Start webServer
  .then(createWebServer)
  // Load web clients in database
  .then(loadClients)
  .catch((error) => {
    log.error("Unable to start:", error);
    process.exit(1);
  });
