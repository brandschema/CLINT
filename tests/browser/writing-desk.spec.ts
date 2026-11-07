import { expect, test } from "@playwright/test";

test("a draft goes through the page and the complete result can be copied", async ({ page, context }) => {
  const draft = "We require your assistance to resolve this request.";
  const output = "We need your help to fix this.\n\nWhat changed\n- was: require your assistance\n  now: need your help\n  why: Uses everyday language.\n\nThis checked the writing, not the facts, the figures, or whether any claim is accurate or compliant.";
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.route("**/api/rewrite", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ draft });
    await route.fulfill({ json: { result: output } });
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Rewrite draft" })).toBeDisabled();
  await page.getByRole("textbox", { name: "Your draft" }).fill(draft);
  await page.getByRole("button", { name: "Rewrite draft" }).click();
  await expect(page.getByLabel("Rewrite and change notes")).toContainText("We need your help to fix this.");
  await expect(page.getByLabel("Rewrite and change notes")).toContainText("What changed");
  await expect(page.getByLabel("Rewrite and change notes")).toContainText("whether any claim is accurate or compliant.");
  await page.getByRole("button", { name: "Copy result" }).click();
  await expect(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(output);
  await page.getByRole("textbox", { name: "Your draft" }).fill("You can check your balance in the app.");
  await expect(page.getByText("You’ve edited your draft.", { exact: false })).toBeVisible();
});

test("an error keeps the draft and offers another attempt", async ({ page }) => {
  await page.route("**/api/rewrite", (route) => route.fulfill({ status: 503, json: { error: "Rewriting isn't connected yet." } }));
  await page.goto("/");
  await page.getByRole("textbox", { name: "Your draft" }).fill("Your card is on its way.");
  await page.getByRole("button", { name: "Rewrite draft" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Rewriting" })).toHaveText("Rewriting isn't connected yet.");
  await expect(page.getByRole("textbox", { name: "Your draft" })).toHaveValue("Your card is on its way.");
  await expect(page.getByRole("button", { name: "Rewrite draft" })).toBeEnabled();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your draft" })).toHaveValue("");
});

test("loading prevents duplicate requests and page contents stay on screen", async ({ page }) => {
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => { finish = resolve; });
  await page.route("**/api/rewrite", async (route) => {
    await pending;
    await route.fulfill({ json: { result: "Your card is on its way.\n\nNo changes made." } });
  });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Your draft" }).fill("Your card is on its way.");
  await page.getByRole("button", { name: "Rewrite draft" }).click();
  await expect(page.getByRole("button", { name: "Working on it" })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "Your draft" })).toHaveAttribute("readonly", "");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  finish?.();
  await expect(page.getByRole("button", { name: "Copy result" })).toBeVisible();
});

test("the empty page has no browser errors or horizontal overflow", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your words.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `verification/${testInfo.project.name}.png`, fullPage: true });
});


test("the browser can reach the real local endpoint without an origin rejection", async ({ page }) => {
  await page.goto("/");
  const response = await page.evaluate(async () => {
    const result = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: " " }),
    });
    return { status: result.status, body: await result.json() };
  });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Paste a draft first.");
});
