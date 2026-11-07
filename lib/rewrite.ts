import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

export const DEFAULT_MODEL = "gpt-5.4-2026-03-05";

export function buildRewriteRequest(prompt: string, draft: string, model: string) {
  return {
    model,
    input: [
      { role: "system" as const, content: prompt },
      { role: "user" as const, content: draft },
    ],
    store: false,
    max_output_tokens: 12_000,
  };
}

export async function rewriteDraft(draft: string, signal?: AbortSignal) {
  const prompt = await readFile(path.join(process.cwd(), "clint-prompt.md"), "utf8");
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0,
    timeout: 90_000,
  });
  const response = await client.responses.create(
    buildRewriteRequest(prompt, draft, process.env.OPENAI_MODEL || DEFAULT_MODEL),
    { signal },
  );

  if (response.status !== "completed" || !response.output_text?.trim()) {
    throw new Error("INCOMPLETE_REWRITE");
  }

  return response.output_text;
}
