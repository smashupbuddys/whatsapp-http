import { FindOrCreateOptions } from "@sequelize/core";
import { Client, LocalAuth, MessageAck } from "whatsapp-web.js";
import ClientModel from "../models/client";
import { clients, deleteClient } from ".";
import QRCode from "qrcode";
import { JsonClient } from "./resources";
import { on_message } from "./webhook";

export async function findClient(clientId: any, can_create: boolean = false) {
  const opts: FindOrCreateOptions = {
    where: { clientId: clientId },
  };

  const [clientModel, created] = await ClientModel.findOrCreate(opts);
  if (!created && clients[clientId]) {
    return clientModel;
  }

  const client = await new Promise<Client>((resolve, reject) => {
    const client = new Client({
      authStrategy: new LocalAuth({
        dataPath: "./data/",
        clientId: clientId.toString(),
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      },
    });

    client.on("remote_session_saved", () => {
      clientModel.set({
        ready: true,
      });
      clientModel.save();
    });

    client.on("qr", async (qr) => {
      clientModel.set({
        qrCode: await QRCode.toDataURL(qr),
      });
      clientModel.save();
      resolve(client);
    });

    const disconectEvent = async () => {
      const wh = clientModel.get("webHook") as string | null;
      clientModel.set({
        ready: false,
      });
      clientModel.save();
      if (wh) {
        try {
          await fetch(wh, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "disconected",
            }),
          });
        } catch (ex) {}
      }
      deleteClient(clientModel.get("clientId"));
    };
    client.on("auth_failure", disconectEvent);
    client.on("disconnected", disconectEvent);

    client.on("ready", async () => {
      clientModel.set({
        ready: true,
        name: client.info.pushname,
      });
      clientModel.save();

      // ready webhook
      const wh = clientModel.get("webHook") as string | null;
      if (!wh) return;
      try {
        await fetch(wh, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "disconected",
            client: JsonClient(clientModel),
          }),
        });
      } catch (ex) {}
      clientModel.save();
      resolve(client);
    });

    client.on("message_ack", async (message, ack) => {
      switch (ack) {
        case MessageAck.ACK_ERROR:
        case MessageAck.ACK_PENDING:
        case MessageAck.ACK_SERVER:
        case MessageAck.ACK_DEVICE:
        case MessageAck.ACK_READ:
        case MessageAck.ACK_PLAYED:
          // TODO: message ack
          break;
      }
    });

    // TODO: message edit, delete, reaction
    client.on("message_edit", async () => {});
    client.on("message_delete", async () => {});
    client.on("message_reaction", async () => {});

    client.on("message", async (msg) => {
      const a = await on_message(clientModel, msg);
      if (!a) {
        console.error("message_handler failed");
      }
    });

    client.initialize();
    clients[clientId] = client;
  });

  if (!clientModel.get("ready") && !can_create) {
    client.destroy();
  }
  return clientModel;
}
