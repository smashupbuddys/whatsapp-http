import { Op } from "sequelize";
import { findClient } from "./findClient";
import ClientModel from "../models/client";
import fs from "fs";
import path from "path";

export async function loadClients() {
  const clients = await ClientModel.findAll({
    where: {
      ready: {
        [Op.eq]: true,
      },
    },
  });
  clients.map(async (client) => {
    const id = client.get("clientId");
    try {
      const sessionDir = path.join(process.cwd(), "data", `session-${id}`);
      if (fs.existsSync(sessionDir)) {
        const files = fs.readdirSync(sessionDir);
        for (const file of files) {
          if (file.startsWith("Singleton")) {
            const filePath = path.join(sessionDir, file);
            fs.unlinkSync(filePath);
            console.log(`Removed Singleton file: ${filePath}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error removing Singleton files for client ${id}:`, error);
    }
    findClient(id, true);
  });
}
