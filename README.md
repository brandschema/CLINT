# Clint: a brand-voice and claims linter (Monzo prototype)

Clint stands for "claims + lint": it checks how a brand writes and whether its facts agree.

Clint is a standalone prose linter that doesn't depend on Vale. Its rules are stored in YAML brand files, so the code doesn't change when the brand does.

It checks text at three levels:

| Level | What it checks | How |
|---|---|---|
| 1. Pattern rules | Banned words, swaps, apology wording, labels, puns, passive voice, sentence length, inconsistent term spellings | Code (regular expressions and spaCy). The same text always gets the same result. |
| 2. Claim register | Facts that must match on every page: fund counts, fees, protection limits, allowances | Code. It compares values across pages and against a confirmed value. |
| 3. Judgement checklist | Impact first, sincere apologies, humour suited to the channel, jargon, arrogance, sensitive topics | A fixed prompt for a model or a person, which must quote the passage behind each finding |

Every rule records where it comes from (`source`) and whether the guide states it directly or it's our reading of the guide (`basis: stated | inferred`).

## Files

```
clint.py                   single-page linter (levels 1 and 3)
sitecheck.py               cross-page claim register and spelling check (level 2)
rules/monzo.yml            voice rules from monzo.com/tone-of-voice, plus channel settings
rules/monzo-claims.yml     claim patterns, with a `confirmed` value for each
examples/bad.md, good.md   test copy
REVIEW-investments.md      findings for monzo.com/investments
```

## Setup

```bash
pip install pyyaml beautifulsoup4 spacy
python -m spacy download en_core_web_sm
```

## Usage

```bash
# One page or file, with channel-specific checks (e.g. no wit in customer service)
python clint.py https://monzo.com/investments --channel marketing
python clint.py draft.md --channel customer_service --min-level warning

# Markdown or JSON output
python clint.py https://monzo.com/investments --format md > report.md

# Write the judgement checklist prompt for a model or a person to review
python clint.py draft.md --channel operational --judge-prompt review-prompt.md

# Cross-page facts and term spellings
python sitecheck.py https://monzo.com/investments https://monzo.com/savings-isas/stocks-shares-isa
```

`clint.py` exits with code 1 if it finds any error-level issue, so it can block a merge in CI.

Channels: `operational`, `customer_service`, `marketing`, `campaign`, `paid_social`, `organic_social`. The settings come from the guide's "How we sound across channels" section.

## Adding a rule

```yaml
- id: MyRule
  principle: Straightforward kindness
  source: Section name in the guide
  basis: stated          # or inferred
  level: warning         # error | warning | suggestion
  type: swap             # swap | words | pattern | count | passive | acronym | consistency | channel_wit | sentence_length
  message: "Use '{fix}' instead of '{match}'."
  swap:
    purchase: buy
```

## Not built yet

- A grammar check. It missed "Companies worked on digital tech".
- Tracking the same claim across all pages on a site over time
- App copy and image text
- Plugins for Google Docs, Figma or a CMS
