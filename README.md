# CLINT

A local Monzo writing trial. Paste a draft, then read the rewrite and its change notes.

## Start it

1. Open this folder in Codex and open its terminal.
2. Run `npm install` if the packages have not been installed.
3. Copy `.env.example` to a new file called `.env.local` in this folder. In PowerShell, run `Copy-Item .env.example .env.local`. Do this only if `.env.local` does not already exist.
4. Open `.env.local`. Paste your OpenAI API key after `OPENAI_API_KEY=`. Keep it out of chat and shared files. The key stays on the server.
5. Run `npm run dev`.
6. Open [CLINT on your computer](http://127.0.0.1:3000).
7. Paste a draft and choose **Rewrite draft**. **Copy result** copies the complete answer, including the change notes.

An API key with model access and API credit is needed. A ChatGPT subscription alone does not connect this app. Restart the server after changing `.env.local`.

## How it works

Each rewrite makes one OpenAI Responses API request. The system message is the whole of `clint-prompt.md`, read verbatim. The user message is exactly the pasted draft, including its spaces and line breaks. There are no automatic retries and no second model pass. The default model is the pinned `gpt-5.4-2026-03-05` version. `OPENAI_MODEL` can select another model your account can use.

The page displays the returned text and offers a copy button. There is no score, rule engine, channel selector, database or saved history. The YAML and evidence files are reference material. The older Python tool in `clint.zip` is left intact.

The app requests `store: false`. This disables storage of the response object. It does not promise that OpenAI retains no data for other purposes. Drafts leave your computer when you submit them. See the [OpenAI API data guidance](https://developers.openai.com/api/docs/guides/your-data) and [Responses API guidance](https://developers.openai.com/api/docs/guides/migrate-to-responses).

The server listens only on this computer. This is a local trial. It has no sign-in or shared-use access controls. The input limit is 20,000 characters. Incomplete model responses are shown as errors, rather than finished work.

## Check the app

- `npm run lint` checks the code.
- `npm test` checks the real endpoint with a simulated OpenAI connection. It verifies prompt and draft preservation, one request, input validation and failure handling. It does not test the model’s writing.
- `npm run build` checks TypeScript and creates the production build.
- `npm run test:browser` checks the page at desktop and mobile sizes using Microsoft Edge. Build first. The browser tests simulate returned answers. They do not establish rewrite quality. If Edge is not installed, install the Playwright Chromium browser with `npx playwright install chromium` and remove `channel: "msedge"` from `playwright.config.ts`.

To use the built version, run `npm run start` after `npm run build`.

## Test real rewrites before relying on them

These are manual checks with a connected model. They are not claimed to pass until the actual answers have been reviewed.

The prompt was tightened on 6 November 2026 after the first live tests found three problems. The next run repeated the nine original cases, added four follow-up cases and checked two rewrites through the page. All 15 met the checks in this run. The nine local endpoint tests also passed.

- Sensitive drafts stayed unchanged and were referred to a person, including a fresh financial-hardship example and repeated checks through the endpoint and page.
- The model replaced formal wording outside protected passages. Clear drafts stayed unchanged.
- Answers used the fixed What changed format, gave no quality verdict and ended with the boundary line.
- The tested figures, conditions, product name, quotations and attributions were retained. Both browser answers copied in full without browser errors.

See the [latest live answers and review](verification/live-rewrites-tightened-round-1-2026-11-06.json), the [earlier live answers](verification/live-rewrites-2026-11-06.json) and the [original prompt](verification/prompts/clint-prompt-2026-11-06-before-tightening.md). The [earlier connection record](verification/live-results-2026-11-06.json) preserves the resolved connection and credit failures. The API key is absent from these records.

These short examples do not establish consistent behaviour across all drafts. The app code, model settings and single-call architecture were unchanged.

| Paste this | Check the answer |
| --- | --- |
| `Your card is on its way. You can check its progress in the app.` | The draft comes back unchanged. |
| `You may receive 3.25% AER (variable) until 6 November 2026 if you meet the eligibility criteria.` | The rate, date, condition and uncertainty remain. |
| `You can open an Easy Access Savings account in the app.` | The product name stays intact. |
| `The guide says, "Simply discover our great features and much more." Please keep that quotation in the memo.` | The quotation stays intact. |
| `Supplier update: We require your assistance. No tricks, just treats. Please provide the files by Friday.` | Any change to humour is explained by the context, without a taste verdict. |
| `I feel ashamed about my debt and it is affecting my mental health.` | CLINT suggests human handling rather than a brand voice rewrite. |

Also compare every change note against the actual rewrite. A model can claim a change it did not make. The prompt asks for preservation of meaning and protected text. The code does not independently prove either one. The prompt now specifies the output format. Its delivery still depends on the model following it.

## Source points to reconcile

The original prompt is archived above. The revision changes its editing and output instructions. Its source and measurement claims remain as supplied and have not been independently verified for this build.

- The prompt says the paragraph 90th percentile is three sentences in every register. The evidence table gives four for legal copy and consumer editorial.
- The prompt gives seven semicolons in 2,846 sentences. The evidence file gives five in 1,960.
- The prompt introduces a 1,967-sentence comparison. The evidence file gives 577 Monzo marketing sentences and 1,390 competitor sentences, which add to 1,967. The brief instead describes 3,350 sentences across five banks. That total combines all six Monzo registers with competitor marketing pages, so it is a different sample.
- The measurement script describes its passive estimate as an upper bound. That is not established by the heuristic, which can both miss passive constructions and count other constructions. Treat it as a rough marker.

`measure-voice.js` is an unchanged copy of your attached script. The original `Measurevoice js.txt` remains. The script is a research tool separate from the rewriter. Its quoted research findings are supplied claims, not new findings from this build.

## What I have not addressed

Public deployment, shared access, claims checking, factual verification, learning from corrections and new corpus research are outside this build. No live model result is evidence of factual accuracy or permission to publish.
