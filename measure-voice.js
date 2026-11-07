/**
 * measure-voice.js
 *
 * Brand voice measurement. Takes a set of URLs, returns comparable numbers.
 * Brand-agnostic: nothing in here is Monzo-specific except the optional swap list.
 *
 * Produces, per corpus:
 *   sentence length distribution (mean, p25, median, p75, p90, max, % short, % long)
 *   paragraph size in sentences and words
 *   contractions per 100 words
 *   passive constructions per 100 sentences
 *   connective sentence openers (but / and / so / because) as % of sentences
 *   first, second and third person pronoun density per 1,000 words
 *   punctuation rates per 100 sentences
 *   hits against a supplied word list
 *
 * TWO WAYS TO RUN IT
 *
 * 1. Browser console, same-origin only. Open any page on the target domain, paste
 *    this file, then:
 *       await measureVoice('monzo_marketing', ['/current-account', '/savings'])
 *    Same-origin fetch means one domain per session. Navigate to change brand.
 *
 * 2. Node with Playwright, any domain:
 *       node measure-voice.js config.json
 *    where config.json is:
 *       { "corpora": { "monzo_marketing": ["https://monzo.com/current-account", ...] } }
 *
 * THE PROSE GATE, AND WHY IT IS NOT OPTIONAL
 *
 * Only <p> elements are measured, and a paragraph counts only if it has at least
 * MIN_WORDS words and ends in terminal punctuation.
 *
 * Without the gate, "Step 1" and "2.80% AER (variable)" count as three-word
 * sentences. Measured on real estates the gate drops 40-66% of <p> blocks and
 * moves the sentence mean by 40-70%. Ungated figures describe a content
 * management system, not a writer, and they are not comparable across brands
 * because different platforms wrap different things in <p>.
 *
 * Always report the drop rate alongside the numbers. A drop rate above about 70%
 * means the page is mostly interface and the sample is too thin to trust.
 */

const MIN_WORDS = 5;

const ABBREV = /\b(e\.g|i\.e|etc|Mr|Mrs|Ms|Dr|No|vs|approx|Ltd|plc|a\.m|p\.m|U\.K|U\.S)\.$/i;

const CONTRACTION = /\b\w+['’](s|t|re|ve|ll|d|m)\b/gi;

// Over-reports. Treat every passive figure as an upper bound.
const PASSIVE =
  /\b(is|are|was|were|be|been|being)\s+(?:\w+ed|given|taken|made|sent|held|paid|shown|known|seen|done|put|set|kept|found|told|left|built|brought|written|chosen|dealt|used|added|removed|charged|applied)\b/gi;

const FIRST_PERSON_PLURAL = ['we','our','us','ours',"we're","we've","we'll","we'd"];
const SECOND_PERSON       = ['you','your','yours',"you're","you've","you'll","you'd"];
const FIRST_PERSON_SING   = ['i','my','me','mine',"i'm","i've","i'll"];

const CONNECTIVE_OPENERS = ['But','And','So','Because'];

/** Replace with the client's own list. These ten are Monzo's. */
const DEFAULT_WORD_LIST = [
  'assistance','require','requires','required','enable','enables','obtain',
  'provide','provides','provided','request','requests','resolve','therefore',
  'utilise','utilize','however'
];

// ---------------------------------------------------------------- primitives

function splitSentences(text) {
  const parts = text.replace(/([.!?])\s+(?=[A-Z“"'(£0-9])/g, '$1\u0001').split('\u0001');
  const out = [];
  let buf = '';
  for (const p of parts) {
    buf = buf ? buf + ' ' + p : p;
    // hold the buffer open across abbreviations and decimals
    if (ABBREV.test(buf.trim()) || /\b\d+\.$/.test(buf.trim())) continue;
    out.push(buf.trim());
    buf = '';
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter(s => /[A-Za-z]/.test(s) && s.split(/\s+/).length > 1);
}

function splitWords(s) {
  return s.match(/[A-Za-z’'£%\d][A-Za-z’'\-\d.%]*/g) || [];
}

function percentile(arr, q) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

function isProse(text) {
  return splitWords(text).length >= MIN_WORDS && /[.!?]["'’)\]]?$/.test(text.trim());
}

// ------------------------------------------------------------------ analysis

/**
 * Measure an array of HTML strings. Environment-independent: pass a DOMParser
 * (browser) or any parser exposing the same interface.
 */
function measureHtml(label, htmlDocs, parseHtml, wordList = DEFAULT_WORD_LIST) {
  const lengths = [], paraSentences = [], paraWords = [];
  let words = 0, contractions = 0, passives = 0, kept = 0, dropped = 0;
  const openers = Object.fromEntries(CONNECTIVE_OPENERS.map(o => [o, 0]));
  const pronouns = { we: 0, you: 0, i: 0 };
  const punct = { comma: 0, dash: 0, paren: 0, colon: 0, semicolon: 0, question: 0, exclamation: 0 };
  const listHits = {};

  for (const html of htmlDocs) {
    if (!html) continue;
    const doc = parseHtml(html);
    doc.querySelectorAll('script,style,noscript,nav,footer,header,svg,button')
       .forEach(n => n.remove());
    const root = doc.querySelector('main') || doc.body;

    root.querySelectorAll('p').forEach(node => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.length < 2) return;
      if (!isProse(text)) { dropped++; return; }
      kept++;

      const sentences = splitSentences(text);
      if (!sentences.length) return;
      paraSentences.push(sentences.length);
      paraWords.push(splitWords(text).length);

      for (const s of sentences) {
        const w = splitWords(s);
        lengths.push(w.length);
        words += w.length;
        contractions += (s.match(CONTRACTION) || []).length;
        passives     += (s.match(PASSIVE)     || []).length;

        const first = (w[0] || '').replace(/[^A-Za-z]/g, '');
        const cap = first ? first[0].toUpperCase() + first.slice(1).toLowerCase() : '';
        if (openers[cap] !== undefined) openers[cap]++;

        punct.comma       += (s.match(/,/g) || []).length;
        punct.dash        += (s.match(/[—–]|\s-\s/g) || []).length;
        punct.paren       += (s.match(/\(/g) || []).length;
        punct.colon       += (s.match(/:/g) || []).length;
        punct.semicolon   += (s.match(/;/g) || []).length;
        if (/\?$/.test(s)) punct.question++;
        if (/!$/.test(s)) punct.exclamation++;

        for (const token of w) {
          const l = token.toLowerCase().replace(/[^a-z’']/g, '');
          if (FIRST_PERSON_PLURAL.includes(l)) pronouns.we++;
          if (SECOND_PERSON.includes(l))       pronouns.you++;
          if (FIRST_PERSON_SING.includes(l))   pronouns.i++;
        }

        for (const term of wordList) {
          if (new RegExp('\\b' + term + '\\b', 'i').test(s)) {
            listHits[term] = (listHits[term] || 0) + 1;
          }
        }
      }
    });
  }

  const n = lengths.length || 1;
  const listTotal = Object.values(listHits).reduce((a, b) => a + b, 0);
  const per100 = v => +(100 * v / n).toFixed(1);

  return {
    label,
    pages: htmlDocs.filter(Boolean).length,
    blocks_kept: kept,
    blocks_dropped: dropped,
    drop_rate_pct: +(100 * dropped / (kept + dropped || 1)).toFixed(1),
    sentences: lengths.length,
    words,
    sentence_length: {
      mean:   +(lengths.reduce((a, b) => a + b, 0) / n).toFixed(1),
      p25:    percentile(lengths, 0.25),
      median: percentile(lengths, 0.50),
      p75:    percentile(lengths, 0.75),
      p90:    percentile(lengths, 0.90),
      max:    lengths.length ? Math.max(...lengths) : null,
      pct_le_10: +(100 * lengths.filter(x => x <= 10).length / n).toFixed(1),
      pct_ge_25: +(100 * lengths.filter(x => x >= 25).length / n).toFixed(1)
    },
    paragraph: {
      sentences_median: percentile(paraSentences, 0.50),
      sentences_p90:    percentile(paraSentences, 0.90),
      words_median:     percentile(paraWords, 0.50)
    },
    contractions_per_100w: +(100 * contractions / (words || 1)).toFixed(2),
    passives_per_100s:     per100(passives),
    connective_openers_pct: +(100 * Object.values(openers).reduce((a, b) => a + b, 0) / n).toFixed(1),
    openers_breakdown: openers,
    pronouns_per_1000w: {
      we:  +(1000 * pronouns.we  / (words || 1)).toFixed(1),
      you: +(1000 * pronouns.you / (words || 1)).toFixed(1),
      i:   +(1000 * pronouns.i   / (words || 1)).toFixed(1),
      you_to_we: pronouns.we ? +(pronouns.you / pronouns.we).toFixed(1) : null
    },
    punctuation_per_100s: Object.fromEntries(
      Object.entries(punct).map(([k, v]) => [k, per100(v)])
    ),
    word_list_per_10000w: +(10000 * listTotal / (words || 1)).toFixed(1),
    word_list_hits: listHits
  };
}

// --------------------------------------------------------- browser-console use

/** Same-origin only. Navigate to the target domain first. */
async function measureVoice(label, paths, wordList) {
  const htmlDocs = [];
  for (const p of paths) {
    try {
      const r = await fetch(p);
      htmlDocs.push(r.ok ? await r.text() : null);
    } catch { htmlDocs.push(null); }
  }
  const parser = new DOMParser();
  return measureHtml(label, htmlDocs, h => parser.parseFromString(h, 'text/html'), wordList);
}

if (typeof window !== 'undefined') {
  window.measureVoice = measureVoice;
  window.measureHtml = measureHtml;
}

// ------------------------------------------------------- node + playwright use

if (typeof module !== 'undefined' && require.main === module) {
  (async () => {
    const fs = require('fs');
    const { chromium } = require('playwright');
    const { JSDOM } = require('jsdom'); // npm i jsdom

    const config = JSON.parse(fs.readFileSync(process.argv[2] || 'config.json', 'utf8'));
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const results = {};

    for (const [label, urls] of Object.entries(config.corpora)) {
      const htmlDocs = [];
      for (const url of urls) {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          htmlDocs.push(await page.content());
        } catch (e) {
          console.error('skipped', url, e.message);
          htmlDocs.push(null);
        }
      }
      results[label] = measureHtml(
        label, htmlDocs,
        h => new JSDOM(h).window.document,
        config.wordList
      );
      console.error(`${label}: ${results[label].sentences} sentences, ` +
                    `${results[label].drop_rate_pct}% dropped`);
    }

    await browser.close();
    process.stdout.write(JSON.stringify(results, null, 2));
  })();
}

if (typeof module !== 'undefined') {
  module.exports = { measureHtml, measureVoice, splitSentences, splitWords, isProse };
}

/**
 * RUNNING IT ON A NEW CLIENT
 *
 * 1. Build the corpus by purpose, not by URL pattern. Group pages by what they
 *    are for: marketing, support, legal, editorial. Mixing purposes inside one
 *    label produces an average of two voices and describes neither.
 *
 * 2. Aim for 300+ sentences per corpus. Below about 250 the percentiles move
 *    around; rates (contractions, passives) are stable earlier.
 *
 * 3. Report the drop rate every time. It is the honesty check on the sample.
 *
 * 4. Comparing brands: identical method, identical page types, same country.
 *    US and UK financial copy differ systematically, so a US brand in a UK set
 *    lands as a finding about the brand when it is a finding about the market.
 *
 * 5. Classify word-list hits by hand before reporting them. Measured on Monzo,
 *    a plain string match was wrong 64% of the time on one word and 71% on the
 *    adjective list. The three false-positive classes to expect are product
 *    names, the brand quoting its own rule, and third-party attributions.
 *
 * 6. Run the brand's own guidelines document through the word list as a control.
 *    It should come back clean. If it does not, the exclusions are wrong.
 *
 * KNOWN WEAKNESSES
 *
 * - Sentence splitting is regex-based. It joins a heading to the paragraph below
 *   it where the heading has no full stop.
 * - Passive detection over-reports and catches no irregular participles beyond
 *   the listed set.
 * - Contraction counting treats possessive 's as a contraction.
 * - Nothing here measures meaning, accuracy, or whether a claim is compliant.
 */