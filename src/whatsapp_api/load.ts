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
    findClient(id, true);
  });
}
