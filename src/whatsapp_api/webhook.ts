import { Chat, Message, MessageAck } from "whatsapp-web.js";
import log from "../lib/logger";

function formatStatus(messageAck: Message) {
  const acks = {
    [MessageAck.ACK_ERROR]: "error",
    [MessageAck.ACK_PENDING]: "pending",
    [MessageAck.ACK_SERVER]: "delivered",
    [MessageAck.ACK_DEVICE]: "sent",
    [MessageAck.ACK_READ]: "read",
    [MessageAck.ACK_PLAYED]: "read",
  };
  return {
    id: messageAck.id._serialized,
    status: acks[messageAck.ack],
    timestamp: Math.floor(Date.now()).toString(),
    recipient_id: messageAck.from,
  };
}

async function formatMessage(message: Message) {
  const quote = message.hasQuotedMsg
    ? await message.getQuotedMessage()
    : undefined;
  return {
    from: message.from.split("@")[0],
    id: message.id._serialized,
    timestamp: Math.floor(message.timestamp).toString(),
    type: "text",
    text: {
      body: message.body,
    },
    context: quote
      ? {
          from: quote.from.split("@")[0],
          id: quote.id._serialized,
        }
      : undefined,
  };
}

export async function webhookHandler(
  client: any,
  messages: Message[],
  messageAcks: Message[]
) {
  const webhookUrl = client.get("webHook");
  if (messages.length == 0 && messageAcks.length == 0) return true;

  try {
    const payload = {
      object: "whatsapp_web_account",
      entry: [
        {
          id: client.get("clientId"),
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: client.get("name"),
                  phone_number_id: client.get("clientId"),
                },
                messages: await Promise.all(
                  messages.filter((m) => m.type == "chat").map(formatMessage)
                ),
                statuses: messageAcks?.map(formatStatus),
              },
              field: "messages",
            },
          ],
        },
      ],
    };
    log.debug("Payload webhook: ", payload.entry[0]);
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch (error) {
    log.warn("Failed to notify webhook of message:", error);
    return false;
  }
  return true;
}
