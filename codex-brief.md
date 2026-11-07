# CLINT: build brief

Paste this into Codex to start. It assumes the eight files in this folder.

---

## What you are building

A brand voice rewriter. Someone pastes in a draft. It comes back rewritten in the brand's voice, with a note saying what changed and why.

Not a linter. Not a scorer. A rewriter with a rationale.

## Architecture

One model call.

- **System prompt:** the whole of `clint-prompt.md`, verbatim.
- **User message:** the pasted draft, nothing added.
- **Output:** the rewrite, then the change note, then one boundary line.

That is the entire core. Resist building more than this until something is demonstrably missing.

## Do not build a rule engine

There are 37 rules in `monzo-voice-rules.yaml` with regexes, exclusion lists and part-of-speech requirements. **They are reference, not implementation.**

They exist because a string matcher needs them. Measured on the brand's own estate, a plain string match on the word lists was wrong 64% of the time on one word and 71% on another, and returned 16 errors on the brand's own guidelines page, all of them wrong. Those exclusion lists are scaffolding to stop a dumb matcher embarrassing itself.

A model reading the sentence does not need any of it. It can see that `Easy Access Savings` is a product name and that a quoted rule is a quotation. Build the model call. Keep the YAML for when someone asks where a number came from.

## The five things that will break it

In order of how fast they kill the trial.

1. **Rewriting good writing.** If it always rewrites, it will churn decent prose and the user stops. Instruction two in the prompt is to say so and hand the draft back unchanged. Test this first: paste in something already well written and confirm it comes back untouched.

2. **Changing what a sentence commits to.** A hedge smoothed into a promise, a condition softened into a guarantee, a figure "tidied". In financial copy that is not a style bug, it is a compliance incident. The prompt tells it to leave figures, rates, dates and regulatory wording alone and explain why in the note.

3. **Flagging product names.** `Easy Access Savings` contains a word on the cut list. It is a product. Case matters: `Easy Access` is the product, `easy access` is a claim.

4. **Flagging quotations.** A memo quoting the brand's own guidelines trips four of the word rules at once. Anything in quotation marks is left alone.

5. **Making taste judgements.** Never tell the writer a joke is weak or the draft is dull. The prompt can say a line sits in a register that does not take humour. It cannot say the humour is bad. A tool that marks a senior person's wit gets closed and not reopened.

## The output contract

```
<the rewrite, or the original unchanged>

What changed
- was: <quote>
  now: <quote>
  why: <one short sentence>
- ... (group similar changes, do not list twelve contractions separately)

This checked the writing, not the facts, the figures, or whether any claim is
accurate or compliant.
```

No score. No verdict. No comment on quality. The closing line matters: it tells the user where the boundary is, which makes their feedback about what the tool does rather than what it missed.

## The files

| File | What it is | Use it for |
|---|---|---|
| `clint-prompt.md` | The system prompt | **This is the product.** Swap this file to change brand. |
| `monzo-writing-principles.md` | The brand's own guidelines, reconstructed complete | Source of truth. Three sections and five tables were images or collapsed panels and are missing from every PDF print of it. |
| `monzo-corpus-evidence.md` | Measurement record, 50 pages, six registers, four competitors | Where every number in the prompt came from. Read the method section before trusting any figure. |
| `measure-voice.js` | The measurement script | Run it on the next client. Brand-agnostic. |
| `monzo-voice.yaml` | The guidelines as structured data | The word lists, the channel matrix, the emotional palette. |
| `monzo-voice-rules.yaml` | 37-rule checking spec with reasoning and error rates | Reference. Read `core_three` and `cosmetic` at the top. |
| `monzo-voice-channels.yaml` | Per-register thresholds and competitor benchmarks | Reference. Read `differentiators`. |

## The three numbers worth knowing before you start

Measured across five UK banks, 3,350 sentences.

**Sentence length does not differentiate this brand.** Monzo 14.0 words on the mean, Lloyds 13.2, Barclays 14.5, Revolut 14.9, Vanguard 14.6. The most repeated claim about Monzo's writing is not true. Do not let the rewriter chase short sentences.

**Three measures do.** Contractions (3.19 against a competitor cluster at 1.97 to 2.08), active voice (3.6 passives per 100 sentences against 9.6 and 11.5), and starting sentences with *but*, *and* or *so* (3.8% against 0.4% and 0.0%). Those three are the voice. They are the priorities in the prompt and they should be the first thing you check in the output.

**The brand fails its own standard on two thirds of its estate.** Marketing, legal and brand writing are contracted well above the field. Help content and both blogs sit inside the competitor band. If the rewriter is used on help content, expect it to make real changes.

## Reusing this for another client

Everything brand-specific is in `clint-prompt.md`. The other files are either evidence for that one file or the method that produced it.

To run the method on a new brand:

1. Build the corpus by purpose, not URL pattern. Marketing, support, legal, editorial. 300+ sentences each.
2. Run `measure-voice.js`. Report the drop rate every time.
3. Measure three or four competitors the same way, same country, same page types.
4. Find which measures separate the brand from the field. They will not be the ones the brand thinks.
5. Classify the word-list hits by hand before reporting them. Expect three false-positive classes: product names, the brand quoting its own rule, third-party attributions.
6. Run the brand's own guidelines through the word list as a control. It should come back clean.
7. Write the prompt around what actually differentiates, not around what the guidelines emphasise.

Step 4 is the one that matters commercially. Every brand believes something about its voice that the measurement does not support.

## What is not in scope and should not be added yet

- Channel classification. Asking the user to pick a register before it will run is where they stop.
- Claim and compliance checking. Different rule base, different regulator, and a memo is not a financial promotion.
- Any form of score, dashboard or history.
- Learning from corrections. If the user overrules the same thing three times the prompt will not adapt. That is a real limitation and solving it now rebuilds the rule engine this brief exists to avoid.
