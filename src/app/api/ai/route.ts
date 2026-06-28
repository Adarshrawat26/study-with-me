import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, PREMIUM_LIMITS } from "@/lib/utils";
import { hasPremiumAccess, canUseAIMode, type AIMode } from "@/lib/premium-access";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const aiSchema = z.object({
  message: z.string().min(1).max(4000),
  mode: z.enum(["chat", "quiz", "flashcard", "summary"]).default("chat"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const limit = hasPremiumAccess({
    id: user.id,
    email: user.email,
    isPremium: user.isPremium,
  })
    ? PREMIUM_LIMITS.aiPrompts
    : FREE_LIMITS.aiPrompts;

  // Reset monthly usage
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  if (user.aiUsageReset < monthAgo) {
    await prisma.user.update({
      where: { id: user.id },
      data: { aiUsageCount: 0, aiUsageReset: new Date() },
    });
    user.aiUsageCount = 0;
  }

  if (user.aiUsageCount >= limit) {
    return NextResponse.json(
      { error: `Monthly AI limit reached (${limit}). Upgrade to Premium.` },
      { status: 403 }
    );
  }

  const body = await req.json();
  const data = aiSchema.parse(body);

  const premiumUser = {
    id: user.id,
    email: user.email,
    isPremium: user.isPremium,
  };

  if (!canUseAIMode(data.mode as AIMode, premiumUser)) {
    return NextResponse.json(
      { error: "Quiz, flashcards, and summary modes are Premium. Chat is free." },
      { status: 403 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured. Add ANTHROPIC_API_KEY to .env" },
      { status: 503 }
    );
  }

  const systemPrompts: Record<string, string> = {
    chat: "You are Study with me AI, a helpful study assistant for students. Be concise, accurate, and encouraging.",
    quiz: "Generate exactly 5 multiple-choice questions (A-D) on the given topic. Format each question clearly with options and mark the correct answer.",
    flashcard: "Generate 8 flashcard pairs (Question/Answer format) on the given topic for study and revision.",
    summary: "Summarize the following text into clear, concise bullet points suitable for revision. Highlight key concepts.",
  };

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompts[data.mode],
      messages: [{ role: "user", content: data.message }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    await prisma.user.update({
      where: { id: user.id },
      data: { aiUsageCount: user.aiUsageCount + 1 },
    });

    return NextResponse.json({
      reply: text,
      usage: user.aiUsageCount + 1,
      limit,
    });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
