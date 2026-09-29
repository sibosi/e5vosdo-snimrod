"use client";

import { ChatWallMessage } from "@/types/chat_wall";
import { DisplayUser } from "@/types/users";
import SearchUser from "@/components/searchUser";
import { Switch } from "@heroui/react";
import {
  requestPushPermissionAndSubscribe,
  subscribePush,
} from "@/components/PWA/subscribePush";
import * as React from "react";
import { useState } from "react";

interface ChatWallProps {
  initialMessages: ChatWallMessage[];
  mentionUsers: DisplayUser[];
  pushPermission: boolean;
  pushAboutChatwall: boolean;
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
  pushPermission,
  pushAboutChatwall,
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
  const [newestFirst, setNewestFirst] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(pushPermission);
  const [isPushAboutChatwall, setIsPushAboutChatwall] =
    useState(pushAboutChatwall);
  const [isUpdatingPush, setIsUpdatingPush] = useState(false);
  const [expandedMentions, setExpandedMentions] = useState<Set<number>>(
    new Set(),
  );
  const displayedMessages = newestFirst ? messages : [...messages].reverse();

  function toggleMentions(messageId: number) {
    setExpandedMentions((current) => {
      const next = new Set(current);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }

  async function updatePushSettings(settings: {
    push_permission?: boolean;
    push_about_chatwall?: boolean;
  }) {
    const response = await fetch("/api/editMySettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    if (!response.ok)
      throw new Error("Nem sikerült menteni a push beállítást.");
  }

  async function togglePush(enabled: boolean) {
    setIsUpdatingPush(true);
    setError("");
    try {
      if (enabled) {
        if (Notification.permission === "granted") {
          await subscribePush();
        } else {
          await requestPushPermissionAndSubscribe();
        }
      }
      await updatePushSettings({ push_permission: enabled });
      setIsPushEnabled(enabled);
    } catch (pushError) {
      setError(
        pushError instanceof Error
          ? pushError.message
          : "Nem sikerült módosítani a push beállítást.",
      );
    } finally {
      setIsUpdatingPush(false);
    }
  }

  async function toggleChatwallPush(enabled: boolean) {
    setIsUpdatingPush(true);
    setError("");
    try {
      await updatePushSettings({ push_about_chatwall: enabled });
      setIsPushAboutChatwall(enabled);
    } catch (pushError) {
      setError(
        pushError instanceof Error
          ? pushError.message
          : "Nem sikerült módosítani a Fal push beállítását.",
      );
    } finally {
      setIsUpdatingPush(false);
    }
  }

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/55">
              Közös fal
            </p>
            <p className="mt-2 max-w-xl text-foreground/70">
              Indíts egy beszélgetést, vagy szólj hozzá egy meglévőhöz.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <Switch
                size="sm"
                isSelected={isPushEnabled}
                isDisabled={isUpdatingPush}
                onValueChange={togglePush}
              >
                Push értesítések
              </Switch>
              <Switch
                size="sm"
                isSelected={isPushAboutChatwall}
                isDisabled={!isPushEnabled || isUpdatingPush}
                onValueChange={toggleChatwallPush}
              >
                A Fal minden üzenete
              </Switch>
            </div>
          </div>
          <button
            type="button"
            aria-label="Sorrend megfordítása"
            title="Sorrend megfordítása"
            onClick={() => setNewestFirst((current) => !current)}
            className="shrink-0 rounded-full border border-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-foreground/5"
          >
            Sorrend: {newestFirst ? "legújabbak elöl" : "legrégebbiek elöl"}
          </button>
        </div>
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
          onSelectMention={(user) =>
            setMentionedUsers((current) =>
              current.some((selected) => selected.email === user.email)
                ? current
                : [...current, user],
            )
          }
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
        {displayedMessages.map((message) => (
          <article
            key={message.id}
            className="relative rounded-2xl border border-foreground/15 p-5"
          >
            <MentionToggle
              users={message.mentioned_users}
              isOpen={expandedMentions.has(message.id)}
              onToggle={() => toggleMentions(message.id)}
            />
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
                  onSelectMention={(user) =>
                    setReplyMentionedUsers((current) =>
                      current.some((selected) => selected.email === user.email)
                        ? current
                        : [...current, user],
                    )
                  }
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
                  <div key={reply.id} className="relative pr-12">
                    <MentionToggle
                      users={reply.mentioned_users}
                      isOpen={expandedMentions.has(reply.id)}
                      onToggle={() => toggleMentions(reply.id)}
                    />
                    <MessageHeader message={reply} />
                    <p className="wrap-break-word mt-2 whitespace-pre-wrap text-sm leading-6">
                      {reply.content}
                    </p>
                    {expandedMentions.has(reply.id) && (
                      <MentionedUsers users={reply.mentioned_users} />
                    )}
                  </div>
                ))}
              </div>
            )}
            {expandedMentions.has(message.id) && (
              <MentionedUsers users={message.mentioned_users} />
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
      { name: user.display_name, class: user.class ?? "", image: user.image },
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

function MentionedUsers({ users }: Readonly<{ users: DisplayUser[] }>) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/55">
        Megemlített személyek
      </p>
      {users.length === 0 ? (
        <p className="text-xs text-foreground/45">Nincs megemlített személy.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <span
              key={user.email}
              className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-2.5 py-1.5 text-xs"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/15 font-semibold">
                  {user.display_name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="font-semibold">{user.display_name}</span>
              {user.class && (
                <span className="text-foreground/55">{user.class}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MentionToggle({
  users,
  isOpen,
  onToggle,
}: Readonly<{
  users: DisplayUser[];
  isOpen: boolean;
  onToggle: () => void;
}>) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={`${users.length} megemlítés megjelenítése`}
      title="Megemlített személyek megjelenítése"
      onClick={onToggle}
      className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-foreground/60 hover:bg-foreground/10 hover:text-foreground"
    >
      <span aria-hidden="true">@</span>
      <span>{users.length}</span>
    </button>
  );
}

function MentionTextarea({
  value,
  onChange,
  mentionUsers,
  onSelectMention,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  mentionUsers: DisplayUser[];
  onSelectMention?: (user: DisplayUser) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">) {
  const [isFocused, setIsFocused] = useState(false);
  const mentionStart = value.lastIndexOf("@");
  const token = mentionStart >= 0 ? value.slice(mentionStart + 1) : "";
  const hasMentionBoundary =
    mentionStart === 0 || /\s/.test(value[mentionStart - 1]);
  const isMentioning = isFocused && hasMentionBoundary && !/\s/.test(token);
  const usersNameByEmail = Object.fromEntries(
    mentionUsers.map((user) => [
      user.email,
      { name: user.display_name, class: user.class ?? "", image: user.image },
    ]),
  );

  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
      />
      {isMentioning && (
        <div className="absolute left-3 top-full z-10 mt-1 w-[min(20rem,calc(100%-1.5rem))]">
          <SearchUser
            usersNameByEmail={usersNameByEmail}
            onSelectEmail={(email) => {
              const user = mentionUsers.find(
                (candidate) => candidate.email === email,
              );
              if (!user) return;
              onChange(`${value.slice(0, mentionStart)}@${user.display_name} `);
              onSelectMention?.(user);
              setIsFocused(false);
            }}
            showInput={false}
            inputValue={token}
            excludeEmails={[]}
          />
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
