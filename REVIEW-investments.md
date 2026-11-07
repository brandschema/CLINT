# Monzo Investments: voice and claims check

Pages checked on 6 November 2026:
- [monzo.com/investments](https://monzo.com/investments) (994 words)
- [monzo.com/savings-isas/stocks-shares-isa](https://monzo.com/savings-isas/stocks-shares-isa) (708 words), the ISA page it links to
- [Monzo Learn: What is a stocks and shares ISA?](https://monzo.com/learn/money-tomorrow/what-is-a-stocks-and-shares-isa), for the claim cross-check only

Rules come from [Monzo's Writing Principles](https://monzo.com/tone-of-voice). This is independent discussion material, not commissioned by or endorsed by Monzo.

Each finding has one of four labels:
- **Checked**: counted by code, or compared with a primary source
- **Stated rule**: the guide says it directly
- **Inferred rule**: our reading of a stated principle
- **Judgement**: a reviewer's reading, which needs a person to confirm it

---

## Summary

1. **Two facts conflict across Monzo's own pages.** This is the most useful finding, and it isn't about voice.
   - The investments page says "We have 17 investments in total". The ISA page says "We have 15 investments to choose from". *(Checked)*
   - The ISA page says eligible investments are protected up to £85,000. The Monzo Learn ISA article says the FSCS "protects some investments up to a value of £120,000". The [FSCS](https://www.fscs.org.uk/what-we-cover/) gives £85,000 for investments and £120,000 for deposits, so the Learn page is the one that's wrong. *(Checked)*
2. **The pages mostly follow the guide's hard rules.** There are no formal apologies, no banned puns, no "blacklist" and no literal magic. None of the guide's ten formal words appear on the investments page. *(Checked)*
3. **They lean on the guide's banned adjectives.** "Simple" appears six times across the two pages, including "Simple, transparent fees" twice. "Great value for beginners" uses another word on the list. *(Checked against a stated rule)*
4. **Product names are spelled three ways.** The pages use "stocks and shares ISA", "Stocks and Shares ISA" and "Stocks & Shares ISA". "General Investment Account" is written in two ways in consecutive paragraphs. *(Checked against an inferred rule)*
5. **"Simple" and "no jargon" sit uneasily with the detail.** The fee line has two parts: a platform fee plus fund costs "that depend on what you invest in". The page also uses terms like "diversified", "attitude to risk", "bonds" and "accrue" without explaining them. *(Judgement)*

---

## 1. Claim register (cross-page facts)

| Claim | Investments page | ISA page | Other | Status |
|---|---|---|---|---|
| Number of investments | 17 | 15 | | Conflict |
| FSCS limit for investments | not stated | £85,000 | Learn: £120,000; [FSCS](https://www.fscs.org.uk/what-we-cover/): £85,000 | Learn page wrong |
| Platform fee | 0.25% yearly | 0.25% (0.20% with Perks or Max) | | Consistent, not yet confirmed |
| Yearly fee cap | £250 | not stated | | Not yet confirmed |
| ISA allowance | £20,000 a year | £20,000 each year | | Consistent |
| Minimum to invest | £1 | £1 | | Consistent |
| Suggested minimum term | not stated | at least 5 years | Learn: 5 years | Consistent (written as "five" and "5" on the ISA page) |

"Not yet confirmed" means the pages agree with each other, but nobody has checked the value against Monzo's internal source. The register has a `confirmed` field for that value.

## 2. Pattern findings (automatic)

These run in marketing mode, where the guide sets wit to Medium. Each one is a suggestion or warning, not a ruling.

| Page | Line | Rule (basis) | Found |
|---|---|---|---|
| Investments | 3, 39 | Empty adjectives (stated) | "Simple, transparent fees" (×2) |
| Investments | 6 | Empty adjectives (stated) | "Keep it simple with ready-made funds" |
| Investments | 43 | Empty adjectives (stated) | "Great value for beginners" |
| Investments | 54 | Empty adjectives (stated) | "just a simple way to keep building" |
| Investments | 56 | Empty adjectives (stated) | "packed with helpful ways" |
| Investments | 40 | Crutch word "just" (stated) | "Just more of your money invested" |
| Investments | 60 | Consistency (inferred) | "General Investment Account" / "general investment account"; "stocks and shares ISA" / "Stocks and Shares ISA" |
| Investments | 60, 62 | Sentence length (inferred) | 31 and 27 words |
| ISA | 7, 10, 26 | Empty adjectives (stated) | "simple fees", "Keep it simple", "Simple, transparent fees" |
| ISA | 29 | Passive voice (stated) | "Your fees accrue daily, and are charged monthly" (could be "We take your fees monthly") |
| ISA | 42 | Sentence length (inferred) | Comma splice joining two sentences |

**Known false positives:** "is packed with" (line 56) and "Once that's sorted" (ISA line 23) are flagged as passive. They are descriptive, and nobody is avoiding responsibility. They should be ignored. The guide's concern is passive voice that hides who did something.

## 3. Judgement review

These findings come from a model reading the pages against the checklist in `examples/judge-prompt-investments.md`. The checklist quotes the guide. A model checking its own reading isn't independent verification, so treat these as prompts for a person.

| Guide principle | Passage | Reading |
|---|---|---|
| Watch out for jargon | "pick a diversified ready-made fund based on your attitude to risk" (ISA) and "no jargon" (ISA line 7) | "Diversified" and "attitude to risk" are industry terms. They sit next to a claim of "no jargon". |
| Watch out for jargon | "Bonds that mature within one year" (investments) | "Bonds" and "mature" aren't explained, on a page that says "Great value for beginners". |
| Swap formal words | "Your fees accrue daily" (ISA) | "Accrue" isn't on the guide's list, but it's the kind of Latin-rooted word the guide warns about. |
| Focus on what matters | "any interest you earn will be tax-free" (ISA line 42) | Returns from a stocks and shares ISA come mostly from growth and dividends, not interest. A reader might confuse this with a cash ISA. |
| Focus on what matters | "Any income (increases in the value of your investments)" (ISA line 47) | This defines income as growth in value, which mixes two different ideas. It's worth a check with the product and compliance teams. |
| Serious isn't formal | "Without a penny paid in tax on anything you earn" next to "The taxes you pay depend on your circumstances" | An absolute claim sits beside a qualifier. The claim is bolder than the qualifier allows. |
| Self-assured, not arrogant | "your money's in expert hands" next to the footer "BlackRock has no obligation or liability…" | It's reassuring, but the disclaimer below it weakens it. |
| Avoid empty adjectives | "Level up your investment knowledge", "Invest on autopilot", "Let experts do the hard work for you" | These are common fintech phrases. Any investment platform could use them. |
| Everyday magic / warm wit | "Questions, meet answers", "Money shouldn't just sit there", "sneaky 'admin' fees" | These are the few lines that sound like Monzo's voice. |

**Copy errors the linter doesn't catch** (no grammar checker yet):
- "Companies worked on digital tech like VR and gaming" should be "working on".
- "Largest 500 publicly traded companies in USA" is missing "the".
- "BlackRock isn't responsible… and BlackRock don't guarantee" uses two different verb agreements in one sentence.

## 4. Is the voice still distinct?

The linter can't answer this on its own. It measures how closely copy follows Monzo's own guide, not whether it sounds different from other banks. On the investments page, the hard rules are followed. The distinctive layer the guide calls "everyday magic" and "warm wit" is thin, though, and much of the page uses language a competitor could use word for word. This is a judgement, but it's specific enough to test. Running the same rules on equivalent pages from other providers would show whether Monzo's investments copy still stands apart.

An early, unscored sample of current account and savings pages gave about 13–20 findings per 1,000 words on Monzo pages. Starling, Barclays and HSBC pages gave 22–26. That's too small and too rough to cite. It only suggests a fuller comparison is worth running.

---

## Method and limits

- Text is taken from the live page HTML. Navigation, footers, buttons and scripts are removed. App copy and images aren't checked.
- Pattern rules come from the guide's own lists, such as the formal-word swaps and the adjectives and phrases to remove. Rules marked "inferred" are our interpretation.
- Passive voice and sentence length use spaCy's English model, so a few false positives are expected (see above).
- The claim register only finds claims its patterns describe. A new claim type needs a new pattern.
- Nothing here has been confirmed by Monzo.
