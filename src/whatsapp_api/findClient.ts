import { FindOrCreateOptions } from "@sequelize/core";
import { Client, LocalAuth, MessageAck } from "whatsapp-web.js";
import ClientModel from "../models/client";
import { clients, deleteClient } from ".";
import QRCode from "qrcode";
import { webhookHandler } from "./webhook";
import log from "../lib/logger";

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
        dataPath: "./data/sessions",
        clientId: clientId.toString(),
      }),
      puppeteer: {
        headless: true,
        executablePath: "/usr/bin/google-chrome-stable",
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
      log.warn("Client disconected: " + clientModel.get("name"));
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
              object: "whatsapp_web_account",
              entry: [
                {
                  id: clientModel.get("clientId"),
                  changes: [
                    {
                      value: {
                        messaging_product: "whatsapp",
                        metadata: {
                          display_phone_number: clientModel.get("name"),
                          phone_number_id: clientModel.get("clientId"),
                        },
                      },
                      field: "whatsapp_web_disconected",
                    },
                  ],
                },
              ],
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
      log.info("Client initialized: " + client.info.pushname);
      resolve(client);
    });

    client.on("message_ack", async (message, ack) => {
      switch (ack) {
        case MessageAck.ACK_ERROR:
        case MessageAck.ACK_PENDING:
        case MessageAck.ACK_SERVER:
          break;
        case MessageAck.ACK_DEVICE:
        case MessageAck.ACK_READ:
        case MessageAck.ACK_PLAYED:
          log.http("Message ack: " + message.id);
          const a = await webhookHandler(clientModel, [], [message]);
          break;
      }
    });

    // TODO: message edit, delete, reaction
    client.on("message_edit", async () => {});
    client.on("message_delete", async () => {});
    client.on("message_reaction", async () => {});

    client.on("message", async (msg) => {
      log.http("Message recived: " + clientModel.get("name"));
      const a = await webhookHandler(clientModel, [msg], []);
      if (!a) {
        log.warn("message_handler failed");
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
