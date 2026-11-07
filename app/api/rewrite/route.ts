import OpenAI from "openai";
import { MAX_DRAFT_CHARACTERS } from "@/lib/limits";
import { rewriteDraft } from "@/lib/rewrite";

export const runtime = "nodejs";
export const maxDuration = 120;

function error(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const expectedOrigin = `${url.protocol}//${request.headers.get("host") || url.host}`;
  if (origin && origin !== expectedOrigin) {
    return error("Open CLINT in this browser to send a draft.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("We couldn't read that draft. Please try again.", 400);
  }

  const draft = body && typeof body === "object" && "draft" in body ? body.draft : null;
  if (typeof draft !== "string" || !draft.trim()) {
    return error("Paste a draft first.", 400);
  }
  if (draft.length > MAX_DRAFT_CHARACTERS) {
    return error("This draft is too long. Keep it under 20,000 characters and try again.", 400);
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return error("Rewriting isn't connected yet. Add your OpenAI API key to .env.local, then restart CLINT.", 503);
  }

  try {
    const result = await rewriteDraft(draft, request.signal);
    return Response.json({ result }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    if (cause instanceof OpenAI.APIConnectionTimeoutError) {
      return error("The rewrite took too long. Your draft is still here. Please try again.", 504);
    }
    if (cause instanceof OpenAI.APIError) {
      if (cause.status === 401 || cause.status === 403) {
        return error("OpenAI couldn't accept the connection. Check the API key and model access in your settings.", 503);
      }
      if (cause.status === 429) {
        if (cause.code === "credit_balance_exhausted") {
          return error("OpenAI reports no available API credit. Add credit in your OpenAI billing settings, then try again.", 429);
        }
        return error("OpenAI can't take this request right now. Check your API credit or try again shortly.", 429);
      }
    }
    return error("We couldn't finish the rewrite. Your draft is still here. Please try again.", 502);
  }
}
