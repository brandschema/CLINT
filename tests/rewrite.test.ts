import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, mock, test } from "node:test";
import { POST } from "../app/api/rewrite/route";

const originalKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_MODEL;

beforeEach(() => {
  process.env.OPENAI_API_KEY = "clint-test-key";
  process.env.OPENAI_MODEL = "test-model";
});

afterEach(() => {
  mock.restoreAll();
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = originalModel;
});

function request(body: unknown, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: JSON.stringify(body),
  });
}

function modelResponse(text: string, status = "completed") {
  return Response.json({
    id: "resp_test",
    object: "response",
    status,
    output: [{
      type: "message",
      role: "assistant",
      status: "completed",
      content: [{ type: "output_text", text, annotations: [] }],
    }],
  });
}

test("the endpoint sends the complete prompt and untouched draft in exactly one model request", async () => {
  const draft = "  We've saved your spot.\n\nYou may get 3.25% AER (variable) until 6 November 2026.  ";
  const output = `${draft}\n\nWhat changed\nNo changes made.\n\nThis checked the writing, not the facts, the figures, or whether any claim is accurate or compliant.`;
  let sent: Record<string, unknown> = {};
  const transport = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "https://api.openai.com/v1/responses");
    sent = JSON.parse(String(init?.body));
    return modelResponse(output);
  });

  const response = await POST(request({ draft }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { result: output });
  assert.deepEqual(sent.input, [
    { role: "system", content: await readFile("clint-prompt.md", "utf8") },
    { role: "user", content: draft },
  ]);
  assert.equal(sent.model, "test-model");
  assert.equal(sent.store, false);
  assert.equal(transport.mock.callCount(), 1);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("invalid drafts and broken JSON never reach the model", async () => {
  const transport = mock.method(globalThis, "fetch", async () => { throw new Error("Must not call the model"); });
  for (const body of [null, {}, { draft: 4 }, { draft: " \n" }, { draft: "a".repeat(20_001) }]) {
    assert.equal((await POST(request(body))).status, 400);
  }
  assert.equal((await POST(new Request("http://localhost:3000/api/rewrite", { method: "POST", body: "{" }))).status, 400);
  assert.equal(transport.mock.callCount(), 0);
});

test("a missing API key returns a setup message without calling the model", async () => {
  delete process.env.OPENAI_API_KEY;
  const transport = mock.method(globalThis, "fetch", async () => { throw new Error("Must not call the model"); });
  const response = await POST(request({ draft: "Your card is on its way." }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /API key/);
  assert.equal(transport.mock.callCount(), 0);
});

test("requests from another website cannot spend the local API credit", async () => {
  const transport = mock.method(globalThis, "fetch", async () => { throw new Error("Must not call the model"); });
  assert.equal((await POST(request({ draft: "Your card is on its way." }, "https://example.com"))).status, 403);
  assert.equal(transport.mock.callCount(), 0);
});

test("a failed provider request is not retried or exposed to the writer", async () => {
  const transport = mock.method(globalThis, "fetch", async () => Response.json({ error: { message: "private provider detail", type: "server_error" } }, { status: 500 }));
  const response = await POST(request({ draft: "Your card is on its way." }));
  assert.equal(response.status, 502);
  assert.doesNotMatch(JSON.stringify(await response.json()), /private provider detail/);
  assert.equal(transport.mock.callCount(), 1);
});

test("rate limits return a useful message without another model call", async () => {
  const transport = mock.method(globalThis, "fetch", async () => Response.json({ error: { message: "rate limit", type: "rate_limit_error" } }, { status: 429 }));
  const response = await POST(request({ draft: "Your card is on its way." }));
  assert.equal(response.status, 429);
  assert.match((await response.json()).error, /credit|shortly/);
  assert.equal(transport.mock.callCount(), 1);
});

test("an incomplete answer is never presented as a finished rewrite", async () => {
  mock.method(globalThis, "fetch", async () => modelResponse("A partial rewrite without its notes.", "incomplete"));
  const response = await POST(request({ draft: "Your card is on its way." }));
  assert.equal(response.status, 502);
  assert.doesNotMatch(JSON.stringify(await response.json()), /partial rewrite/);
});


test("the local browser host is accepted when Next.js uses a different internal hostname", async () => {
  const output = "Your card is on its way.";
  const transport = mock.method(globalThis, "fetch", async () => modelResponse(output));
  const response = await POST(new Request("http://localhost:3000/api/rewrite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
    },
    body: JSON.stringify({ draft: output }),
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { result: output });
  assert.equal(transport.mock.callCount(), 1);
});


test("an exhausted credit balance is distinguished from a temporary rate limit", async () => {
  const transport = mock.method(globalThis, "fetch", async () => Response.json({
    error: { message: "private billing detail", type: "insufficient_quota", code: "credit_balance_exhausted" },
  }, { status: 429 }));
  const response = await POST(request({ draft: "Your card is on its way." }));
  assert.equal(response.status, 429);
  const body = await response.json();
  assert.match(body.error, /no available API credit/);
  assert.doesNotMatch(body.error, /shortly|private billing detail/);
  assert.equal(transport.mock.callCount(), 1);
});
