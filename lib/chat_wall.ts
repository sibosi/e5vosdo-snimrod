import {
  getAuth,
  getUsersEmailWherePushAboutChatwall,
  newNotificationByEmails,
  User,
} from "@/db/dbreq";
import { dbreq, multipledbreq } from "@/db/db";
import { calculateUserClass } from "@/public/getUserClass";
import { ChatWallMessage, TableChatWallMessages } from "@/types/chat_wall";

function toDisplayUser(
  user: Pick<
    User,
    "email" | "name" | "full_name" | "image" | "coming_year" | "class_character"
  >,
) {
  return {
    email: user.email,
    display_name: user.full_name || user.name || user.email,
    image: user.image || "",
    class: calculateUserClass(user.coming_year, user.class_character),
  };
}

function toMessage(
  row: TableChatWallMessages & {
    user_name: string;
    user_image: string;
    coming_year?: number;
    class_character?: string;
  },
): ChatWallMessage {
  return {
    id: row.id,
    timestamp: row.timestamp,
    author: {
      email: row.user_email,
      display_name: row.user_name,
      image: row.user_image,
      class:
        row.coming_year && row.class_character
          ? calculateUserClass(row.coming_year, row.class_character)
          : row.class_character || null,
    },
    parent_id: row.parent_id,
    content: row.content,
    mentioned_users: [],
  };
}

type ChatWallMentionRow = {
  message_id: number;
  mentioned_user_email: string;
  user_name: string;
  image: string;
  coming_year?: number;
  class_character?: string;
};

export async function getChatWallMentionUsers() {
  const rows = (await dbreq(
    `SELECT email, COALESCE(full_name, name) AS display_name, image,
            coming_year, class_character
     FROM users
     ORDER BY display_name ASC, email ASC;`,
  )) as Array<{
    email: string;
    display_name: string;
    image: string;
    coming_year?: number;
    class_character?: string;
  }>;

  return rows.map((user) => ({
    email: user.email,
    display_name: user.display_name || user.email,
    image: user.image || "",
    class: calculateUserClass(
      user.coming_year ?? 0,
      user.class_character ?? "",
    ),
  }));
}

export async function getChatWallMessages(): Promise<ChatWallMessage[]> {
  const rows = (await dbreq(
    `SELECT m.*, u.coming_year, u.class_character
		 FROM chatwall_messages m
		 LEFT JOIN users u ON u.email = m.user_email
    ORDER BY m.timestamp DESC, m.id DESC;`,
  )) as (TableChatWallMessages & {
    user_name: string;
    user_image: string;
    coming_year?: number;
    class_character?: string;
  })[];

  const messages = rows.map(toMessage);
  const mentionRows = (await dbreq(
    `SELECT mm.message_id, mm.mentioned_user_email,
            COALESCE(u.full_name, u.name) AS user_name, u.image,
            u.coming_year, u.class_character
     FROM chatwall_message_mentions mm
     JOIN users u ON u.email = mm.mentioned_user_email
     WHERE mm.message_id IN (SELECT id FROM chatwall_messages);`,
  )) as ChatWallMentionRow[];
  const mentionsByMessage = new Map<
    number,
    ChatWallMessage["mentioned_users"]
  >();

  for (const mention of mentionRows) {
    const messageId = Number(mention.message_id);
    const users = mentionsByMessage.get(messageId) || [];
    users.push({
      email: mention.mentioned_user_email,
      display_name: mention.user_name,
      image: mention.image || "",
      class: calculateUserClass(
        mention.coming_year ?? 0,
        mention.class_character ?? "",
      ),
    });
    mentionsByMessage.set(messageId, users);
  }

  for (const message of messages) {
    message.mentioned_users = mentionsByMessage.get(message.id) || [];
  }
  const threads = messages.filter((message) => message.parent_id === null);
  const byParent = new Map<number, ChatWallMessage[]>();

  for (const message of messages) {
    if (message.parent_id === null) continue;
    const replies = byParent.get(message.parent_id) || [];
    replies.push(message);
    byParent.set(message.parent_id, replies);
  }

  return threads.map((thread) => ({
    ...thread,
    replies: byParent.get(thread.id) || [],
  }));
}

export async function createChatWallMessage(
  content: string,
  parentId: number | null | undefined,
  mentionedEmails: string[],
) {
  const user = await getAuth();
  if (!user) throw new Error("Unauthorized");

  const trimmedContent = content.trim();
  if (!trimmedContent || trimmedContent.length > 2000) {
    throw new Error("Message must be between 1 and 2000 characters");
  }

  if (parentId !== null && parentId !== undefined) {
    const parent = (await dbreq(
      `SELECT id FROM chatwall_messages WHERE id = ? AND parent_id IS NULL`,
      [parentId],
    )) as { id: number }[];
    if (parent.length === 0) throw new Error("Parent message not found");
  }

  const uniqueEmails = [...new Set(mentionedEmails)].filter(
    (email) => email !== user.email,
  );
  const validMentionRows = uniqueEmails.length
    ? ((await dbreq(
        `SELECT email FROM users WHERE email IN (${uniqueEmails
          .map(() => "?")
          .join(", ")})`,
        uniqueEmails,
      )) as { email: string }[])
    : [];
  const validEmails = validMentionRows.map((row) => row.email);

  const result = await multipledbreq(async (connection) => {
    const [insertResult] = await connection.execute(
      `INSERT INTO chatwall_messages (user_email, user_name, user_image, parent_id, content)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.email,
        user.full_name || user.name || user.email,
        user.image || "",
        parentId ?? null,
        trimmedContent,
      ],
    );
    const messageId = (insertResult as { insertId: number }).insertId;
    for (const email of validEmails) {
      await connection.execute(
        `INSERT INTO chatwall_message_mentions (message_id, mentioned_user_email)
         VALUES (?, ?)`,
        [messageId, email],
      );
    }
    return messageId;
  });

  if (validEmails.length > 0) {
    await newNotificationByEmails(
      "Megemlítettek a Falon",
      trimmedContent,
      validEmails,
      JSON.stringify({
        title: "Megemlítettek a Falon",
        body: `${user.full_name || user.name || user.email} megemlített egy üzenetben`,
        data: { url: "/fal" },
      }),
    );
  }

  const chatwallSubscribers = (
    await getUsersEmailWherePushAboutChatwall()
  ).filter((email) => email !== user.email && !validEmails.includes(email));
  if (chatwallSubscribers.length > 0) {
    await newNotificationByEmails(
      "Új bejegyzés a Falon",
      trimmedContent,
      chatwallSubscribers,
      JSON.stringify({
        title: "Új bejegyzés a Falon",
        body: `${user.full_name || user.name || user.email} új üzenetet írt a Falra`,
        data: { url: "/fal" },
      }),
    );
  }

  return result;
}

export function getChatWallAuthor(user: User) {
  return toDisplayUser(user);
}
