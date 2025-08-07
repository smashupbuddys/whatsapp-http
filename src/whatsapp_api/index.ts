import WAWebJS, { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";

import type { Message, Chat, Contact } from "whatsapp-web.js";

import ClientModel from "../models/client";
import { FindOrCreateOptions, Model } from "@sequelize/core";
import fs from "fs/promises";
import path from "path";
import { JsonChat, JsonClient, JsonContact, JsonMsg } from "./resources";
import { on_message } from "./webhook";

export const clients = {} as {
  [key: string]: Client;
};

export enum ChatState {
  TYPING,
  SEEN,
  RECORDING,
}

const MIME_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "audio/ogg": "ogg",
  "application/pdf": "pdf",
};

function getExtension(mimetype: string): string {
  return MIME_MAP[mimetype] || "bin";
}

export async function sendMessage(
  model: Model<any, any>,
  chatId: string,
  message: string | null = null,
  mediaPath: string | null = null,
  responseToId: string | null = null,
  isAudio: boolean = false
) {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const chat = await client.getChatById(chatId);

  const options: any = {};

  if (responseToId) {
    options.quotedMessageId = responseToId;
  }

  await chat.sendSeen();
  await chat.sendStateTyping();
  await new Promise((resolve) =>
    setTimeout(resolve, Math.log2((message?.length ?? 0) + 10) * 1000)
  );

  if (mediaPath) {
    const media = MessageMedia.fromFilePath(mediaPath);
    if (message) options.caption = message;
    options.sendAudioAsVoice = isAudio;
    return await JsonMsg(await chat.sendMessage(media, options));
  }

  if (message) {
    return await JsonMsg(await chat.sendMessage(message, options));
  }

  throw new Error("Nothing to send: no media or message");
}

export async function getMessage(
  model: Model<any, any>,
  messageId: string
): Promise<object | false> {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const msg = await client.getMessageById(messageId);
  return await JsonMsg(msg);
}
export async function deleteMessage(
  model: Model<any, any>,
  messageId: string
): Promise<object | false> {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const msg = await client.getMessageById(messageId);
  await msg.delete(true);
  return await JsonMsg(msg);
}
export async function forwardMessage(
  model: Model<any, any>,
  messageId: string,
  to: string
): Promise<object | false> {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const msg = await client.getMessageById(messageId);
  await msg.forward(to);
  return await JsonMsg(msg);
}

export async function acceptMessageInvite(
  model: Model<any, any>,
  messageId: string
): Promise<object | false> {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const msg = await client.getMessageById(messageId);

  if (!msg.inviteV4) {
    throw "Message does not have invite";
  }

  await msg.acceptGroupV4Invite();
  return await JsonMsg(msg);
}

export async function getMessageMedia(
  model: Model<any, any>,
  messageId: string
): Promise<string | false> {
  const MEDIA_DIR = path.resolve("./media");
  await fs.mkdir(MEDIA_DIR, { recursive: true });

  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const msg = await client.getMessageById(messageId);
  if (!msg.hasMedia) return false;

  const media = await msg.downloadMedia();
  if (!media) return false;

  const extension = getExtension(media.mimetype);
  const filename = `${msg.id.id}.${extension}`;
  const filepath = path.join(MEDIA_DIR, filename);

  await fs.writeFile(
    filepath,
    Buffer.from(media.data, "base64").toString("binary"),
    "binary"
  );

  return filename;
}

export async function getChats(model: Model<any, any>) {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const chats = await client.getChats();

  const results = await Promise.all(chats.map((chat) => JsonChat(chat)));

  return results;
}
export async function getChat(model: Model<any, any>, chatId: string) {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const chat = await client.getChatById(chatId);

  return await JsonChat(chat);
}

export async function sentChatState(
  model: Model<any, any>,
  chatId: string,
  state: ChatState
) {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const chat = await client.getChatById(chatId);
  switch (state) {
    case ChatState.TYPING:
      await chat.sendStateTyping();
    case ChatState.SEEN:
      await chat.sendSeen();
    case ChatState.RECORDING:
      await chat.sendStateRecording();
  }

  return await JsonChat(chat);
}
export async function getChatMessages(
  model: Model<any, any>,
  chatId: string,
  count: number
) {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const chat = await client.getChatById(chatId);
  if (!chat) return false;

  const msgs = await chat.fetchMessages({ limit: count });

  const m = await Promise.all(msgs.map((msg) => JsonMsg(msg)));

  return m;
}

export async function getContacts(model: Model<any, any>) {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const contacts = await client.getContacts();

  const results = await Promise.all(
    contacts.map(async (contact) => {
      return JsonContact(contact);
    })
  );

  return results;
}

export async function getContact(model: Model<any, any>, chatId: string) {
  const clientId = model.get("clientId") as string | null;
  const client = clients[clientId ?? ""];
  if (!client) throw "Client not found";

  const chat = await client.getChatById(chatId);
  const contact = await chat.getContact();

  return await JsonContact(contact);
}

export async function findClient(
  clientId: any = null,
  can_create: boolean = false
) {
  if (!clientId) {
    clientId = ((await ClientModel.count()) + 1).toString();
  }

  const opts: FindOrCreateOptions = {
    where: { clientId: clientId },
  };

  const [clientModel, created] = await ClientModel.findOrCreate(opts);
  if (!created) {
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
      console.log("saved");
      clientModel.set({
        ready: true,
      });
      clientModel.save();
    });

    client.on("qr", (qr) => {
      console.log("qr");
      clientModel.set({
        qrCode: qr,
      });
      clientModel.save();
      resolve(client);
    });

    client.on("disconnected", async () => {
      const wh = (await clientModel.get("webHook")) as string | null;
      if (!wh) return;
      try {
        await fetch(wh, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "disconected",
          }),
        });
      } catch (ex) {}
    });

    client.on("ready", async () => {
      console.log("ready");
      clientModel.set({
        ready: true,
        name: client.info.pushname,
      });
      clientModel.save();

      // ready webhook
      const wh = (await clientModel.get("webHook")) as string | null;
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
