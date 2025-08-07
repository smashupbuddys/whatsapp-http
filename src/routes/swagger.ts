/**
 * @swagger
 * components:
 *   schemas:
 *     ClientInfo:
 *       type: object
 *       properties:
 *         clientId:
 *           type: string
 *           description: The client's unique identifier
 *         name:
 *           type: string
 *           description: The client's name
 *         ready:
 *           type: boolean
 *           description: Whether the client is ready to send/receive messages
 *         qr:
 *           type: string
 *           nullable: true
 *           description: QR code data for authentication (null if not needed)
 *         webHook:
 *           type: string
 *           nullable: true
 *           description: Webhook URL for receiving messages (if set)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The chat's unique identifier
 *         name:
 *           type: string
 *           description: The chat's display name
 *         unreadCount:
 *           type: number
 *           description: Number of unread messages
 *         lastMessageBody:
 *           type: string
 *           nullable: true
 *           description: The last message's content (if any)
 *         isArchived:
 *           type: boolean
 *           description: Whether the chat is archived
 *         isGroup:
 *           type: boolean
 *           description: Whether this is a group chat
 *         groupMembers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *           nullable: true
 *           description: Array of group members (for group chats)
 *         isMuted:
 *           type: boolean
 *           description: Whether the chat is muted
 *         isReadOnly:
 *           type: boolean
 *           description: Whether the chat is read-only
 *         isPinned:
 *           type: boolean
 *           description: Whether the chat is pinned
 *
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The message's unique identifier
 *         from:
 *           type: string
 *           description: The sender's ID
 *         type:
 *           type: string
 *           description: The message type
 *         body:
 *           type: string
 *           description: The message content
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the message was sent
 *         hasMedia:
 *           type: boolean
 *           description: Whether the message contains media
 *         isForwarded:
 *           type: boolean
 *           description: Whether the message was forwarded
 */
