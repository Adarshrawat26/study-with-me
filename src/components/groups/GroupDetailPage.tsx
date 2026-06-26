"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Pusher from "pusher-js";
import { isPusherConfigured } from "@/lib/pusher-client";
import { GroupSharedTimer } from "@/components/groups/GroupSharedTimer";
import { useToast } from "@/components/ui/Toast";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface GroupDetail {
  group: { id: string; name: string; description: string | null; createdById: string };
  members: { id: string; name: string | null; role: string; isPremium: boolean }[];
  messages: Message[];
  leaderboard: { id: string; name: string; hours: number; streak: number; isPremium: boolean }[];
  isMember: boolean;
}

export default function GroupDetailPage({ groupId }: { groupId: string }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<GroupDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${groupId}`);
    const json = await res.json();
    if (res.ok) {
      setData(json);
      setMessages(json.messages ?? []);
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pusher realtime or polling fallback
  useEffect(() => {
    if (!data?.isMember) return;

    if (isPusherConfigured()) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });
      const channel = pusher.subscribe(`group-${groupId}`);
      channel.bind("new-message", (msg: Message) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`group-${groupId}`);
        pusher.disconnect();
      };
    }

    const interval = setInterval(async () => {
      const res = await fetch(`/api/groups/${groupId}/message`);
      const json = await res.json();
      if (json.messages?.length) {
        setMessages(json.messages);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [groupId, data?.isMember]);

  const joinGroup = async () => {
    const res = await fetch(`/api/groups/${groupId}`, { method: "POST" });
    if (res.ok) {
      toast("Joined group!", "success");
      loadGroup();
    } else {
      const err = await res.json();
      toast(err.error ?? "Failed to join", "error");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input;
    setInput("");

    const res = await fetch(`/api/groups/${groupId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const json = await res.json();
      if (!isPusherConfigured()) {
        setMessages((prev) => [...prev, json.message]);
      }
    } else {
      toast("Failed to send message", "error");
      setInput(content);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="glass-card h-96 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[var(--text-muted)]">Group not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/groups" className="mb-4 inline-block text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        ← Back to groups
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{data.group.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">{data.group.description}</p>
        </div>
        {!data.isMember && (
          <button onClick={joinGroup} className="btn-primary">Join Group</button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <div className="glass-card flex h-[480px] flex-col lg:col-span-2">
          <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-medium">
            Group Chat
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)]">No messages yet. Say hello!</p>
            )}
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.user.id === session?.user?.id ? "flex-row-reverse" : ""}`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/20 text-xs font-semibold text-[var(--primary)]">
                  {msg.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                  msg.user.id === session?.user?.id
                    ? "bg-[var(--primary)] text-white"
                    : "border border-[var(--border)] bg-[var(--surface)]"
                }`}>
                  <p className="text-xs opacity-70">{msg.user.name}</p>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
          {data.isMember ? (
            <div className="flex gap-2 border-t border-[var(--border)] p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button onClick={sendMessage} className="btn-primary px-5">
                Send
              </button>
            </div>
          ) : (
            <div className="border-t border-[var(--border)] p-4 text-center text-sm text-[var(--text-muted)]">
              Join the group to chat
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {data.isMember && (
            <GroupSharedTimer
              groupId={groupId}
              isAdmin={data.members.some(
                (m) => m.id === session?.user?.id && m.role === "admin"
              )}
            />
          )}

          <div className="glass-card p-4">
            <h3 className="section-title mb-3">Members ({data.members.length})</h3>
            <div className="space-y-2">
              {data.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  <span>{m.name ?? "Anonymous"}</span>
                  {m.isPremium && <span className="badge-pro">Pro</span>}
                  {m.role === "admin" && (
                    <span className="text-xs text-[var(--text-muted)]">admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="section-title mb-3">Weekly leaderboard</h3>
            <div className="space-y-2">
              {data.leaderboard.slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span>#{i + 1} {u.name}</span>
                  <span className="font-semibold">{u.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
