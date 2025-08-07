import { Message } from "whatsapp-web.js";
import { JsonChat, JsonClient, JsonMsg } from "./resources";

export async function on_message(client: any, msg: Message) {
  if (!client.get("webHook")) {
    console.log(`${msg.from}: ${msg.body}`);
    console.log(msg);
    return true;
  }

  const chat = await msg.getChat();
  try {
    await fetch(client.get("webHook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: JsonClient(client),
        chat: await JsonChat(chat),
        message: await JsonMsg(msg),
      }),
    });
  } catch {
    console.error("Failed to notify webhook of message");
    return false;
  }
  return true;
}
