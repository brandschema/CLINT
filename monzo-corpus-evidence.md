# Monzo voice: measurement record

Collected 6 November 2026 from live `monzo.com` pages via a browser, server-rendered HTML.

**Monzo corpus: 50 pages, 1,960 sentences, 33,167 words, six registers.**
**Comparison corpus: 4 competitors, 1,390 sentences, 19,684 words.**

## Method, and the one thing that changes every number

Only `<p>` elements are measured, and a paragraph counts only if it carries **five or more words and ends in terminal punctuation**. That gate is not cosmetic. Without it, `Step 1` and `2.80% AER (variable)` count as three-word sentences.

| Effect of the gate | Ungated | Gated |
|---|---|---|
| Monzo marketing, sentence mean | 10.1 | 14.0 |
| Monzo marketing, median | 8 | 13 |
| Monzo marketing, ≤10 words | 60.3% | 36.4% |
| Lloyds, sentence mean | 7.7 | 13.2 |
| Lloyds, median | 5 | 12 |

The gate drops 57% of Monzo's marketing paragraphs and 66% of Lloyds'. Any figure produced without it describes a content management system, not a writer. **All figures below are gated.**

---

# Part 1: Monzo's six registers

| Register | Pages | Sentences | Words |
|---|---|---|---|
| marketing (`/current-account`, `/savings`, `/investments`, `/pensions`, `/flex`, `/joint-account`, `/16-17`) | 7 | 577 | 8,077 |
| editorial_technical (6 engineering and hiring posts) | 6 | 367 | 7,572 |
| customer_service (30 `/help/…` articles) | 30 | 341 | 5,414 |
| operational_legal (`/legal/terms-and-conditions`, `/legal/fscs-information`) | 2 | 324 | 5,716 |
| editorial_consumer (4 consumer research posts) | 4 | 176 | 3,371 |
| brand (`/tone-of-voice`) | 1 | 175 | 3,017 |

## Sentence length

| Register | mean | p25 | median | p75 | p90 | max | ≤10w | ≥25w |
|---|---|---|---|---|---|---|---|---|
| marketing | 14.0 | 8 | 13 | 18 | 23 | 59 | 36.4% | 7.1% |
| customer_service | 15.9 | 11 | 15 | 20 | 27 | 54 | 24.3% | 15.2% |
| brand | 17.2 | 13 | 17 | 21 | 26 | 41 | 17.7% | 13.1% |
| operational_legal | 17.6 | 12 | 17 | 22 | 28 | 50 | 18.5% | 17.6% |
| editorial_consumer | 19.2 | 13 | 19 | 24 | 31 | 47 | 13.6% | 24.4% |
| editorial_technical | 20.6 | 14 | 20 | 26 | 33 | 64 | 12.0% | 31.6% |

Marketing is the shortest and the engineering blog the longest, with a 6.6-word spread across the estate. The ordering is clean and it tracks how much the reader is assumed to want.

## Paragraph size

| Register | sentences, median | sentences, p90 | words, median |
|---|---|---|---|
| customer_service | 1 | 3 | 24 |
| marketing | 2 | 3 | 21 |
| brand | 2 | 3 | 36 |
| editorial_technical | 2 | 3 | 34 |
| operational_legal | 2 | **4** | 33 |
| editorial_consumer | 2 | **4** | 40 |

Three sentences is the ceiling in four of six registers. Legal copy and the consumer blog run to four.

## Register markers

| Register | Contractions /100w | Passives /100 sent | but·and·so openers |
|---|---|---|---|
| brand | 4.11 | 2.9 | 13.7% |
| operational_legal | 3.62 | 7.7 | 1.5% |
| marketing | 3.19 | 3.6 | 3.8% |
| customer_service | 2.14 | 5.6 | 2.6% |
| editorial_consumer | 1.96 | 14.8 | 10.2% |
| editorial_technical | 1.95 | 9.8 | 1.9% |

**The terms and conditions are 69% more contracted than the help content** (3.62 against 2.14). Monzo's most legally constrained writing is also its most spoken, which runs against every expectation and is consistent with their instruction that formality should not rise with the difficulty of the subject.

**The consumer blog carries 14.8 passive constructions per 100 sentences,** four times the marketing rate, under a principle with a whole section devoted to the active voice. It is also one of two registers with no entry in Monzo's channel matrix.

## Stance markers (per 1,000 words)

| Register | we / our / us | you / your | I / my / me | you : we |
|---|---|---|---|---|
| customer_service | 29.6 | 76.7 | 0.6 | 2.6 : 1 |
| operational_legal | 42.3 | 75.4 | 0.0 | 1.8 : 1 |
| marketing | 10.6 | 71.1 | 0.1 | 6.7 : 1 |
| editorial_consumer | 10.4 | 22.5 | 0.0 | 2.2 : 1 |
| editorial_technical | 23.4 | 16.8 | 14.8 | 0.7 : 1 |
| brand | 49.1 | 10.3 | 0.0 | 0.2 : 1 |

First person singular appears only in the signed engineering and hiring posts.

## Punctuation (per 100 sentences)

| Register | comma | ( | dash | : | ; | ? | ! |
|---|---|---|---|---|---|---|---|
| marketing | 64.3 | 6.9 | 6.8 | 1.0 | 0.2 | 0.9 | 0.2 |
| customer_service | 64.2 | 9.1 | 0.9 | 12.6 | 0.0 | 0.6 | 2.3 |
| brand | 73.7 | 6.9 | 8.6 | 6.3 | 0.6 | 2.3 | 0.6 |
| operational_legal | 75.3 | 8.3 | 0.3 | 1.5 | 0.0 | 0.0 | 0.0 |
| editorial_consumer | 110.2 | 15.9 | 11.4 | 4.5 | 0.0 | 4.0 | 0.6 |
| editorial_technical | 113.4 | 6.5 | 4.9 | 14.2 | 0.5 | 1.4 | 2.5 |

Semicolons: 5 in 1,960 sentences. None at all in help content, legal copy or the consumer blog. The practice is unanimous and unwritten.

Dashes split the estate: 6.8 to 11.4 in brand, marketing and consumer editorial, against 0.3 and 0.9 in legal and help content.

## Monzo against its own lexicon

Raw string matches, then classified by hand.

### "just" — 58 occurrences

| Classification | Count | Share |
|---|---|---|
| Filler, a real violation | 21 | 36% |
| Meaningful (*not just*, *just that*, *just as*) | 11 | 19% |
| Minimising a quantity (*just £7 a day*) | 26 | 45% |

A string match on `just` is wrong or unhelpful 64% of the time.

One of the 26 carries real exposure: *"You won't pay Monzo Investments fees, just ongoing fund management costs."* That minimises a charge the customer pays, and no frequency rule would surface it ahead of the other 57.

### Empty adjectives — 48 occurrences

| Classification | Count |
|---|---|
| Attributive and empty | 24 |
| Predicate or comparative, legitimate | 19 |
| Product name (`Easy Access Savings`, `Easy Bank Transfers`) | 5 |

Of the 24, inspection finds further false positives (*"Dachshund or Great Dane?"*, *"a basic calculator handy"*, *"A great magician"*). The real count is nearer 14, so the plain string match is wrong about 71% of the time.

### Swap-list words still in use

| Word | Raw | Real |
|---|---|---|
| provide / provides / provided | 18 | ~7 |
| require / required / requires | 9 | ~4 |
| however | 8 | 8 |
| request / requests | 4 | 3 |
| resolve | 2 | 2 |
| enable / enables | 2 | 1 |
| assistance, obtain, utilise, therefore | 0 | 0 |

Those last four have been eliminated from 33,167 words of Monzo's own copy. The rules worked and could be retired.

### The tone-of-voice page

16 raw lexicon hits on `/tone-of-voice`, **none of them violations.** Every one is Monzo quoting the rule, a manner adverb, a predicate, or the goal stated as such. A naive linter run against Monzo's own guidelines reports 16 errors and is wrong 16 times.

---

# Part 2: Monzo against four UK competitors

Product and marketing pages only, same gate, same script, collected 6 November 2026.

| | Monzo | Lloyds | Barclays | Revolut | Vanguard UK |
|---|---|---|---|---|---|
| Pages | 7 | 6 | 7 | 5 | 7 |
| Sentences | 577 | 451 | 376 | 250 | 313 |
| Words | 8,077 | 5,952 | 5,448 | 3,723 | 4,561 |
| Sentence mean | 14.0 | 13.2 | 14.5 | 14.9 | 14.6 |
| Sentence median | 13 | 12 | 14 | 13 | 13 |
| ≤10 words | 36.4% | 40.6% | 31.9% | 35.6% | 29.7% |
| **Contractions /100w** | **3.19** | 1.97 | 2.06 | 0.64 | 2.08 |
| **Passives /100 sent** | **3.6** | 11.5 | 9.6 | 15.6 | 6.4 |
| **but·and·so openers** | **3.8%** | 0.4% | 0.0% | 0.0% | 1.6% |
| Dashes /100 sent | 6.8 | 1.6 | 3.2 | 4.8 | 2.6 |
| you : we | 6.7 : 1 | 2.8 : 1 | 3.1 : 1 | 5.3 : 1 | 3.2 : 1 |
| Swap-list /10,000w | 3.7 | 6.7 | 7.3 | 48.3 | **2.2** |

## What the comparison shows

**Sentence length does not differentiate Monzo.** Five brands inside 1.7 words on the mean and 2 on the median. The most repeated claim about Monzo's writing is not true of Monzo.

**Three measures do, and Monzo leads all three.** Contractions, active voice, connective openers. Lloyds, Barclays and Vanguard cluster tightly at 1.97 to 2.08 contractions; Monzo is 53% above all of them. Monzo's passive rate is a third of the nearest bank's. Barclays and Revolut start a sentence with *but*, *and* or *so* zero times across 626 sentences.

**Being a digital challenger does not explain it.** Revolut is the other app-first challenger and is the most formal of the five: lowest contractions, highest passive rate, thirteen times Monzo's swap-list vocabulary.

**Vanguard is the only brand that comes close,** and by a different route. Cleanest formal vocabulary of all five at 2.2 per 10,000 words, second on active voice and second on connective openers, but not spoken at 2.08 contractions. Deliberate plainness rather than imitation.

**Monzo's own advantage is confined to three registers.** Marketing (3.19), legal (3.62) and brand (4.11) are contracted well above the field. Help content (2.14) and both blogs (1.96, 1.95) sit inside the Lloyds-to-Vanguard band, which means that on two thirds of Monzo's published estate the voice is indistinguishable from the competition.

## Caveats on the comparison

- Revolut's 48.3 is driven by 16 *provide* forms, some of which will be partner attributions, the same false-positive class as Monzo's insurance lines. The real gap is smaller and still large.
- Revolut 250 sentences and Vanguard 313 are adequate for rates and thin for percentiles.
- One snapshot. This cannot show convergence over time. Archived copy from 2013 to 2016 run through the same script would date it, and would also separate competitive imitation from regulatory pressure.
- Trading 212 returns a Cloudflare challenge and is not in the set.
- Charles Schwab was excluded on purpose: US copy, US regulator, US conventions would land as a finding about Schwab when it is a finding about America.

---

# What the corpus does not cover

- **App copy, in-app chat, notifications and email.** Not reachable from the public web. This is the register Monzo rates highest for kindness and it has no measurement behind it. It is probably where most customer-read words live.
- **Campaigns, paid social and organic social.** Monzo's matrix rates all three; none is on monzo.com. Organic social is rated maxed out for wit, so the humour rules are least evidenced exactly where wit matters most.
- **Internal memos, presentations and supplier correspondence.** No public source exists.
- **Voice of customer.** 50 pages of Monzo talking, never a customer answering. `community.monzo.com` is the obvious source.
- **Four collapsed sections on the voice page** are excluded from the word counts. Their text was recovered separately from Monzo's page data and appears in `monzo-writing-principles.md`.

## Known weaknesses in the method

- **The sentence splitter is regex-based.** Abbreviations, decimals and currency are protected. It still joins a heading to the paragraph below it where the heading lacks a full stop, which inflates a handful of lengths.
- **Passive detection is a pattern match** and over-reports. Every passive figure here is an upper bound.
- **"Real violation" counts in the lexicon tables are hand classifications by one reader,** not a second-marked exercise.
- **Both editorial samples are small:** 4 posts and 6 posts, and the consumer four are all research-led, which is a particular kind of post.
