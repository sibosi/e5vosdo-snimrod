"use client";

import { ChatWallMessage } from "@/types/chat_wall";
import { DisplayUser } from "@/types/users";
import SearchUser from "@/components/searchUser";
import * as React from "react";
import { useState } from "react";

interface ChatWallProps {
  initialMessages: ChatWallMessage[];
  mentionUsers: DisplayUser[];
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function ChatWall({
  initialMessages,
  mentionUsers,
}: Readonly<ChatWallProps>) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState<DisplayUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyMentionedUsers, setReplyMentionedUsers] = useState<DisplayUser[]>(
    [],
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const response = await fetch("/api/chat-wall", { cache: "no-store" });
    if (!response.ok) throw new Error("Nem sikerült frissíteni az üzeneteket.");
    setMessages(await response.json());
  }

  async function submitMessage(
    event: { preventDefault: () => void },
    parentId: number | null,
    message: string,
    selectedMentionEmails: string[],
  ) {
    event.preventDefault();
    if (!message.trim() || isSending) return;
    setIsSending(true);
    setError("");
    try {
      const response = await fetch("/api/chat-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          parentId,
          mentionedEmails: [
            ...selectedMentionEmails,
            ...mentionUsers
              .filter((user) => message.includes(`@${user.display_name}`))
              .map((user) => user.email),
          ],
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Nem sikerült elküldeni az üzenetet.");
      setContent("");
      setMentionedUsers([]);
      setReplyContent("");
      setReplyMentionedUsers([]);
      setReplyingTo(null);
      await refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Nem sikerült elküldeni az üzenetet.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 pb-16">
      <div className="mb-8 border-b border-foreground/15 pb-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/55">
          Közös fal
        </p>
        <p className="mt-2 max-w-xl text-foreground/70">
          Indíts egy beszélgetést, vagy szólj hozzá egy meglévőhöz.
        </p>
      </div>

      <form
        onSubmit={(event) =>
          submitMessage(
            event,
            null,
            content,
            mentionedUsers.map((user) => user.email),
          )
        }
        className="mb-10"
      >
        <MentionTextarea
          value={content}
          onChange={setContent}
          mentionUsers={mentionUsers}
          placeholder="Mi jár a fejedben?"
          maxLength={2000}
          rows={3}
          className="w-full resize-y rounded-2xl border border-foreground/20 bg-background p-4 text-foreground outline-none transition focus:border-foreground/60"
        />
        <MentionField
          users={mentionUsers}
          selectedUsers={mentionedUsers}
          onChange={setMentionedUsers}
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-xs text-foreground/45">
            {content.length}/2000
          </span>
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSending ? "Küldés..." : "Új beszélgetés"}
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}
      <div className="space-y-5">
        {messages.length === 0 && (
          <p className="py-12 text-center text-foreground/55">
            Még nincs itt beszélgetés.
          </p>
        )}
        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-2xl border border-foreground/15 p-5"
          >
            <MessageHeader message={message} />
            <p className="wrap-break-word mt-4 whitespace-pre-wrap text-[15px] leading-7">
              {message.content}
            </p>
            <button
              type="button"
              onClick={() =>
                setReplyingTo(replyingTo === message.id ? null : message.id)
              }
              className="mt-4 text-sm font-semibold text-foreground/65 hover:text-foreground"
            >
              {replyingTo === message.id ? "Mégse" : "Válasz"}
            </button>
            {replyingTo === message.id && (
              <form
                onSubmit={(event) =>
                  submitMessage(
                    event,
                    message.id,
                    replyContent,
                    replyMentionedUsers.map((user) => user.email),
                  )
                }
                className="mt-4 border-t border-foreground/10 pt-4"
              >
                <MentionTextarea
                  value={replyContent}
                  onChange={setReplyContent}
                  mentionUsers={mentionUsers}
                  placeholder="Írj választ..."
                  maxLength={2000}
                  rows={2}
                  className="w-full resize-y rounded-xl border border-foreground/20 bg-background p-3 text-sm outline-none focus:border-foreground/60"
                />
                <MentionField
                  users={mentionUsers}
                  selectedUsers={replyMentionedUsers}
                  onChange={setReplyMentionedUsers}
                />
                <button
                  type="submit"
                  disabled={isSending || !replyContent.trim()}
                  className="mt-2 rounded-full border border-foreground/30 px-4 py-1.5 text-sm font-semibold hover:bg-foreground/5 disabled:opacity-40"
                >
                  Válasz küldése
                </button>
              </form>
            )}
            {!!message.replies?.length && (
              <div className="mt-5 space-y-4 border-l-2 border-foreground/10 pl-4">
                {message.replies.map((reply) => (
                  <div key={reply.id}>
                    <MessageHeader message={reply} />
                    <p className="wrap-break-word mt-2 whitespace-pre-wrap text-sm leading-6">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {!!message.mentioned_users.length && (
              <p className="mt-4 text-xs text-foreground/50">
                Megemlítve:{" "}
                {message.mentioned_users
                  .map((user) => `@${user.display_name}`)
                  .join(", ")}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function MentionField({
  users,
  selectedUsers,
  onChange,
}: Readonly<{
  users: DisplayUser[];
  selectedUsers: DisplayUser[];
  onChange: (users: DisplayUser[]) => void;
}>) {
  const usersNameByEmail = Object.fromEntries(
    users.map((user) => [
      user.email,
      { name: user.display_name, class: user.class ?? "" },
    ]),
  );

  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/55">
        Megemlítések
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {selectedUsers.map((user) => (
          <span
            key={user.email}
            className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-1 text-xs font-semibold"
          >
            @{user.display_name}
            <button
              type="button"
              aria-label={`${user.display_name} eltávolítása`}
              onClick={() =>
                onChange(
                  selectedUsers.filter(
                    (selected) => selected.email !== user.email,
                  ),
                )
              }
              className="text-sm leading-none text-foreground/55 hover:text-foreground"
            >
              x
            </button>
          </span>
        ))}
        <SearchUser
          usersNameByEmail={usersNameByEmail}
          onSelectEmail={(email) => {
            const user = users.find((candidate) => candidate.email === email);
            if (user) onChange([...selectedUsers, user]);
          }}
          placeholder="Felhasználó keresése"
          size="sm"
          excludeEmails={selectedUsers.map((user) => user.email)}
        />
      </div>
    </div>
  );
}

function MentionTextarea({
  value,
  onChange,
  mentionUsers,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  mentionUsers: DisplayUser[];
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">) {
  const [isFocused, setIsFocused] = useState(false);
  const mentionStart = value.lastIndexOf("@");
  const token = mentionStart >= 0 ? value.slice(mentionStart + 1) : "";
  const hasMentionBoundary =
    mentionStart === 0 || /\s/.test(value[mentionStart - 1]);
  const options =
    isFocused && hasMentionBoundary && !/\s/.test(token)
      ? mentionUsers
          .filter((user) =>
            user.display_name
              .toLocaleLowerCase()
              .includes(token.toLocaleLowerCase()),
          )
          .slice(0, 6)
      : [];

  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
      />
      {!!options.length && (
        <div className="absolute left-3 top-full z-10 mt-1 max-h-52 w-[min(20rem,calc(100%-1.5rem))] overflow-y-auto rounded-xl border border-foreground/15 bg-background p-1 shadow-lg">
          {options.map((user) => (
            <button
              type="button"
              key={user.email}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(
                  `${value.slice(0, mentionStart)}@${user.display_name} `,
                );
                setIsFocused(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-foreground/10"
            >
              <span className="font-semibold">{user.display_name}</span>
              {user.class && (
                <span className="ml-2 text-xs text-foreground/50">
                  {user.class}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageHeader({ message }: Readonly<{ message: ChatWallMessage }>) {
  return (
    <header className="flex items-center gap-3">
      {message.author.image ? (
        <img
          src={message.author.image}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-sm font-semibold">
          {message.author.display_name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {message.author.display_name}
        </p>
        <p className="text-xs text-foreground/50">
          {formatTimestamp(message.timestamp)}
          {message.author.class ? ` · ${message.author.class}` : ""}
        </p>
      </div>
    </header>
  );
}
