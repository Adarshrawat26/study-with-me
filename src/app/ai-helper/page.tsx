"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { PremiumUpsell } from "@/components/ui/PremiumUpsell";
import { cn } from "@/lib/utils";

type AIMode = "chat" | "quiz" | "flashcard" | "summary";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Explain Newton's Laws in simple terms",
  "Quiz me on Organic Chemistry",
  "Make a 3-month study plan for physics",
  "Summarize key ideas from a topic I'm revising",
];

const MODES: { id: AIMode; label: string; premium: boolean }[] = [
  { id: "chat", label: "Chat", premium: false },
  { id: "quiz", label: "Quiz", premium: true },
  { id: "flashcard", label: "Flashcards", premium: true },
  { id: "summary", label: "Summary", premium: true },
];

export default function AIHelperPage() {
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium ?? false;
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AIMode>("chat");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ count: 0, limit: 10 });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectMode = (id: AIMode, locked: boolean) => {
    if (locked) {
      toast("Quiz, flashcards & summary are Premium features", "info");
      return;
    }
    setMode(id);
  };

  const sendMessage = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;

    const modeConfig = MODES.find((m) => m.id === mode);
    if (modeConfig?.premium && !isPremium) {
      toast("This AI mode requires Premium", "error");
      return;
    }

    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "AI request failed", "error");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      setUsage({ count: data.usage, limit: data.limit });
    } catch {
      toast("Failed to reach AI", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
      <PageHeader
        title="AI assistant"
        subtitle={`Powered by Claude · ${usage.count}/${usage.limit} prompts this month${isPremium ? " · all modes" : " · chat only"}`}
      />

      {!isPremium && (
        <PremiumUpsell
          compact
          className="mb-3"
          title="Free: chat mode only (10/mo)"
          description=""
        />
      )}

      <div className="mb-3 flex gap-2 overflow-x-auto">
        {MODES.map(({ id, label, premium }) => {
          const locked = premium && !isPremium;
          return (
            <button
              key={id}
              onClick={() => selectMode(id, locked)}
              className={cn(
                "whitespace-nowrap rounded-[var(--radius)] px-3 py-1.5 text-xs font-medium transition-colors",
                mode === id
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border-subtle)] text-[var(--text-muted)]",
                locked && "opacity-60"
              )}
            >
              {label}{locked ? " 🔒" : ""}
            </button>
          );
        })}
        {!isPremium && (
          <Link href="/pricing" className="ml-auto self-center text-xs font-semibold text-[var(--primary)] hover:underline">
            Upgrade for quiz & more →
          </Link>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
            <p className="text-sm text-[var(--text-muted)]">Ask anything about your studies</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} className="pill hover:border-[var(--primary)]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[85%] rounded-[var(--radius-lg)] px-4 py-3 text-sm ${
              m.role === "user"
                ? "ml-auto bg-[var(--primary)] text-white"
                : "border border-[var(--border-subtle)] bg-[var(--surface)]"
            }`}
          >
            <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-1 px-4">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a study question…"
          className="input-field flex-1"
        />
        <button onClick={() => sendMessage()} disabled={loading} className="btn-primary px-5">
          Send
        </button>
      </div>
    </div>
  );
}
