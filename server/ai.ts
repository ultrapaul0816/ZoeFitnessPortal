import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

type AIProvider = "anthropic" | "openai";

function getProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY) return "openai";
  throw new Error("No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.");
}

interface AICompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature?: number;
  jsonMode?: boolean;
  /** OpenAI model to use when falling back to OpenAI (default: gpt-4o) */
  openaiModel?: string;
}

export async function createAICompletion(options: AICompletionOptions): Promise<string> {
  const provider = getProvider();

  if (provider === "anthropic") {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const systemPrompt = options.jsonMode
      ? options.systemPrompt + "\n\nIMPORTANT: You must respond with valid JSON only. No markdown formatting, no code fences, no extra text — just the raw JSON object."
      : options.systemPrompt;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: options.maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: options.userPrompt }],
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    });

    const textBlock = response.content.find((b: Anthropic.ContentBlock) => b.type === "text");
    return (textBlock as Anthropic.TextBlock)?.text || "";
  } else {
    const openai = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: options.openaiModel || "gpt-4o",
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      max_tokens: options.maxTokens,
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
    });

    return response.choices[0]?.message?.content || "";
  }
}

export function hasAIKey(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
}

export function getAIProviderName(): string {
  if (process.env.ANTHROPIC_API_KEY) return "Anthropic Claude";
  if (process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY) return "OpenAI";
  return "None";
}
