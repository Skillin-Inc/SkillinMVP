// Message database operations
import { executeQuery } from "./connection";
import { NewMessage } from "./types";

export async function createMessage(data: NewMessage) {
  const { sender_id, receiver_id, content } = data;

  const result = await executeQuery(
    `INSERT INTO public.messages
      ("sender_id", "receiver_id", "content")
     VALUES ($1, $2, $3)
     RETURNING "id", "sender_id", "receiver_id", "content", "is_read", "created_at"`,
    [sender_id, receiver_id, content]
  );

  return result.rows[0];
}

export async function getMessagesBetweenUsers(userId1: string, userId2: string) {
  const result = await executeQuery(
    `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at,
            u1."first_name" as sender_first_name, u1."last_name" as sender_last_name,
            u2."first_name" as receiver_first_name, u2."last_name" as receiver_last_name
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."id"
     JOIN public.users u2 ON m.receiver_id = u2."id"
     WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
        OR (m.sender_id = $2 AND m.receiver_id = $1)
     ORDER BY m.created_at ASC`,
    [userId1, userId2]
  );

  return result.rows;
}

export async function getConversationsForUser(userId: string) {
  const result = await executeQuery(
    `SELECT DISTINCT 
            CASE 
                WHEN m.sender_id = $1 THEN m.receiver_id 
                ELSE m.sender_id 
            END as other_user_id,
            CASE 
                WHEN m.sender_id = $1 THEN u2."first_name" 
                ELSE u1."first_name" 
            END as other_user_first_name,
            CASE 
                WHEN m.sender_id = $1 THEN u2."last_name" 
                ELSE u1."last_name" 
            END as other_user_last_name,
            m.content as last_message,
            m.created_at as last_message_time,
            (SELECT COUNT(*) 
             FROM public.messages unread 
             WHERE unread.receiver_id = $1 
               AND unread.sender_id = CASE 
                   WHEN m.sender_id = $1 THEN m.receiver_id 
                   ELSE m.sender_id 
               END
               AND unread.is_read = false) as unread_count
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."id"
     JOIN public.users u2 ON m.receiver_id = u2."id"
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function markMessagesAsRead(userId: string, otherUserId: string) {
  const result = await executeQuery(
    `UPDATE public.messages 
     SET "is_read" = true 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false
     RETURNING "id"`,
    [userId, otherUserId]
  );

  return result.rows;
}

export async function getUnreadCount(userId: string, otherUserId: string) {
  const result = await executeQuery(
    `SELECT COUNT(*) as unread_count
     FROM public.messages 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false`,
    [userId, otherUserId]
  );

  return Number(result.rows[0].unread_count);
}
