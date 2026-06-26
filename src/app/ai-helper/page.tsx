"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

type AIMode = "chat" | "quiz" | "flashcard" | "summary";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Explain Newton's Laws for JEE",
  "Quiz me on Organic Chemistry",
  "Make a study plan for JEE in 3 months",
  "Summarize the Indian Constitution basics for UPSC",
];

const MODES: { id: AIMode; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "quiz", label: "Quiz" },
  { id: "flashcard", label: "Flashcards" },
  { id: "summary", label: "Summary" },
];

export default function AIHelperPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AIMode>("chat");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ count: 0, limit: 10 });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;

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
        subtitle={`Powered by Claude · ${usage.count}/${usage.limit} prompts this month`}
      />

      <div className="mb-3 flex gap-2 overflow-x-auto">
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`whitespace-nowrap rounded-[var(--radius)] px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === id
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border-subtle)] text-[var(--text-muted)]"
            }`}
          >
            {label}
          </button>
        ))}
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
