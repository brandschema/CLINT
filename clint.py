#!/usr/bin/env python3
"""
Clint - a brand-voice and claims linter that reads its rules from a YAML brand file.

Usage:
  python clint.py FILE_OR_URL [...] [--rules rules/monzo.yml] [--channel marketing]
                 [--format text|md|json] [--min-level suggestion|warning|error]
                 [--judge-prompt out.md]

Pattern rules are checked by the code, so the same text always gets the same result.
Judgement calls (tone, whether the impact comes before the reasoning, whether a joke suits
the moment) are not scored by the code. --judge-prompt writes a fixed checklist prompt
for a model or a human reviewer instead.
"""
import argparse, json, re, sys, urllib.request
from dataclasses import dataclass, asdict
from pathlib import Path

import yaml

LEVELS = {"suggestion": 0, "warning": 1, "error": 2}

_nlp = None
def nlp():
    global _nlp
    if _nlp is None:
        import spacy
        _nlp = spacy.load("en_core_web_sm", disable=["ner"])
    return _nlp


@dataclass
class Finding:
    file: str
    line: int
    col: int
    rule: str
    level: str
    basis: str
    principle: str
    source: str
    match: str
    message: str
    context: str


# ---------- input ----------

def load_text(src: str) -> str:
    if re.match(r"https?://", src):
        req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0 Clint"})
        raw = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
        return html_to_text(raw)
    raw = Path(src).read_text(encoding="utf-8", errors="ignore")
    if src.endswith((".html", ".htm")):
        return html_to_text(raw)
    if src.endswith(".md"):
        return strip_markdown(raw)
    return raw


def html_to_text(raw: str) -> str:
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(raw, "html.parser")
    for tag in soup(["script", "style", "noscript", "nav", "footer", "header", "svg", "form", "button"]):
        tag.decompose()
    root = soup.find("main") or soup.body or soup
    blocks = []
    for el in root.find_all(["h1", "h2", "h3", "h4", "p", "li", "td", "blockquote"]):
        if el.find(["p", "li"]):  # avoid double-counting nested blocks
            continue
        t = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
        if len(t) > 1:
            blocks.append(t)
    # de-duplicate repeated blocks (cookie banners, repeated CTAs)
    seen, out = set(), []
    for b in blocks:
        if b not in seen:
            seen.add(b); out.append(b)
    return "\n".join(out)


def strip_markdown(raw: str) -> str:
    raw = re.sub(r"```.*?```", lambda m: "\n" * m.group(0).count("\n"), raw, flags=re.S)  # code blocks
    raw = re.sub(r"`[^`]*`", "", raw)                    # inline code
    raw = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", raw)       # images
    raw = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", raw)   # links -> text
    raw = re.sub(r"^\s{0,3}#{1,6}\s*", "", raw, flags=re.M)
    raw = re.sub(r"^\s*>\s?", "", raw, flags=re.M)      # quotes kept as text
    return raw


# ---------- helpers ----------

def norm_quotes(s: str) -> str:
    return s.replace("’", "'").replace("‘", "'")


def line_col(text: str, pos: int):
    line = text.count("\n", 0, pos) + 1
    col = pos - (text.rfind("\n", 0, pos) + 1) + 1
    return line, col


def context_of(text: str, start: int, end: int, width=50):
    a, b = max(0, start - width), min(len(text), end + width)
    s = text[a:b].replace("\n", " ")
    return ("…" if a > 0 else "") + s + ("…" if b < len(text) else "")


def word_pattern(words):
    alts = sorted((re.escape(w).replace(r"\ ", r"\s+") for w in words), key=len, reverse=True)
    return re.compile(r"\b(?:" + "|".join(alts) + r")\b", re.I)


# ---------- checks ----------

def run(text: str, fname: str, rules: dict, channel: str | None):
    text = norm_quotes(text)
    out = []
    dials = rules.get("channels", {})

    def add(rule, start, end, msg, match=None):
        ln, col = line_col(text, start)
        out.append(Finding(fname, ln, col, rule["id"], rule["level"], rule["basis"],
                           rule["principle"], rule["source"],
                           match if match is not None else text[start:end],
                           msg, context_of(text, start, end)))

    doc = None
    for r in rules["rules"]:
        t = r["type"]
        if channel and channel in r.get("exempt_channels", []):
            continue

        if t == "swap":
            pat = word_pattern(r["swap"].keys())
            for m in pat.finditer(text):
                key = re.sub(r"\s+", " ", m.group(0).lower())
                add(r, m.start(), m.end(), r["message"].format(match=m.group(0), fix=r["swap"][key]))

        elif t == "words":
            for m in word_pattern(r["words"]).finditer(text):
                add(r, m.start(), m.end(), r["message"].format(match=m.group(0)))

        elif t == "pattern":
            flags = 0 if r.get("case_sensitive") else re.I
            for m in re.finditer(r["pattern"], text, flags | re.M):
                add(r, m.start(), m.end(), r["message"].format(match=m.group(0)))

        elif t == "count":
            ms = list(re.finditer(r["pattern"], text, re.I))
            if len(ms) > r["max"]:
                for m in ms[r["max"]:]:
                    add(r, m.start(), m.end(), r["message"].format(count=len(ms)))

        elif t == "channel_wit":
            if channel and dials.get(channel, {}).get("wit") == "none":
                for m in re.finditer(r["pattern"], text, re.I):
                    add(r, m.start(), m.end(), r["message"].format(match=m.group(0), channel=channel.replace("_", " ")))

        elif t == "acronym":
            for ac, expansion in r["terms"].items():
                m = re.search(r"\b" + re.escape(ac) + r"s?\b", text)
                if not m:
                    continue
                explained = (re.search(re.escape(expansion), text, re.I)
                             or re.search(r"\b" + re.escape(ac) + r"s?\s+(?:stands for|means|is short for)", text)
                             or re.search(r"\b" + re.escape(ac) + r"s?\s*\([a-z][^)]{3,}\)", text, re.I))
                if not explained:
                    add(r, m.start(), m.end(), r["message"].format(match=ac, expansion=expansion))

        elif t == "consistency":
            for term in r["terms"]:
                pat = re.compile(r"\b" + re.escape(term).replace(r"\ ", r"[\s&-]+").replace("and", "(?:and|&)") + r"s?\b", re.I)
                ms = list(pat.finditer(text))
                variants = {}
                for m in ms:
                    v = (m.group(0)[:-1] if m.group(0).lower().endswith("s") and not term.lower().endswith("s") else m.group(0))
                    variants.setdefault(v, m)
                # ignore pure sentence-start capitalisation of the first letter
                keys = {}
                for v, m in variants.items():
                    at_start = m.start() == 0 or text[m.start()-1] == "\n" or text[max(0, m.start()-2):m.start()] in (". ", "? ", "! ")
                    k = v[1:] if at_start else v
                    keys.setdefault(k, (v, m))
                if len(keys) > 1:
                    vs = [v for v, _ in keys.values()]
                    first = sorted((m for _, m in keys.values()), key=lambda m: m.start())[1]
                    add(r, first.start(), first.end(), r["message"].format(
                        match=term, count=len(vs), variants=", ".join(f"'{v}'" for v in vs)))

        elif t in ("passive", "sentence_length"):
            if doc is None:
                doc = []
                pos = 0
                for ln in text.split("\n"):
                    if ln.strip():
                        d = nlp()(ln)
                        doc.append((pos, d))
                    pos += len(ln) + 1
            if t == "passive":
                for off, d in doc:
                  for sent in d.sents:
                    for tok in sent:
                        if tok.dep_ == "auxpass" and tok.lemma_.lower() != "get":
                            verb = tok.head
                            has_agent = any(c.dep_ == "agent" for c in verb.children)
                            auxes = [c for c in verb.children if c.dep_ in ("aux", "auxpass")] + [verb]
                            span_start = off + min(c.idx for c in auxes)
                            span_end = off + max(tok.idx + len(tok), verb.idx + len(verb))
                            if has_agent:
                                continue  # 'was blocked by us' still says who did it
                            add(r, span_start, span_end,
                                r["message"].format(match=text[span_start:span_end]))
            else:
                for off, d in doc:
                  for sent in d.sents:
                    words = [w for w in sent if w.is_alpha]
                    if len(words) > r["max_words"]:
                        add(r, off + sent.start_char, off + sent.end_char,
                            r["message"].format(count=len(words)),
                            match=sent.text[:60] + ("…" if len(sent.text) > 60 else ""))
    out.sort(key=lambda f: (f.line, f.col))
    return out


# ---------- judgement layer ----------

JUDGE_TEMPLATE = """You are reviewing copy against Monzo's published Writing Principles
({source_url}). The pattern checks have already run; do not repeat them.

Channel: {channel} (guide dials: {dials})

Answer each question below. For every 'No' or 'Unsure', quote the exact passage.
If you can't point to a passage, answer 'Yes'. Do not rewrite the whole piece.

1. Impact first: does the copy say how this affects the reader before explaining why Monzo did it?
   (Guide: "We can explain our reasoning, but need to explain the impact first.")
2. Sorry: is sorry used only where Monzo did something wrong, and said once?
   (Guide: if "we haven't done anything wrong... we shouldn't say sorry.")
3. Serious isn't formal: if the news is bad or sensitive, does the language stay warm and plain?
4. Idioms and references: would someone with English as a second language understand every idiom
   and cultural reference at first glance?
5. Humour fit: is the amount of wit right for this channel's dial? Is any joke the obvious one?
6. Punching down: is anyone (customers, groups, Monzo itself) the target of a joke?
7. Confidence: does anything read as arrogant, or as Monzo looking down on customers?
8. Jargon: is every financial or technical term explained in plain words?
9. Deeper emotions: if the copy touches money stress, shame or mental health, is it handled with care
   and without jokes?

Return a table: question number | Yes / No / Unsure | quoted passage | one-line reason.

--- COPY ---
{text}
"""


def main():
    ap = argparse.ArgumentParser(description="Clint: brand-voice and claims linter")
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--rules", default=str(Path(__file__).parent / "rules/monzo.yml"))
    ap.add_argument("--channel", choices=["operational", "customer_service", "marketing",
                                          "campaign", "paid_social", "organic_social"])
    ap.add_argument("--format", choices=["text", "md", "json"], default="text")
    ap.add_argument("--min-level", choices=list(LEVELS), default="suggestion")
    ap.add_argument("--judge-prompt", help="write a judgement-checklist prompt to this file")
    a = ap.parse_args()

    rules = yaml.safe_load(Path(a.rules).read_text())
    all_findings, texts = [], {}
    for src in a.inputs:
        text = load_text(src)
        texts[src] = text
        fs = [f for f in run(text, src, rules, a.channel) if LEVELS[f.level] >= LEVELS[a.min_level]]
        all_findings += fs

    if a.format == "json":
        print(json.dumps([asdict(f) for f in all_findings], indent=2, ensure_ascii=False))
    elif a.format == "md":
        print(to_markdown(all_findings, texts, a.channel))
    else:
        for f in all_findings:
            print(f"{f.file}:{f.line}:{f.col}  {f.level:<10} {f.rule:<16} {f.message}")
        counts = {l: sum(f.level == l for f in all_findings) for l in LEVELS}
        print(f"\n{len(all_findings)} findings  ({counts['error']} errors, {counts['warning']} warnings, {counts['suggestion']} suggestions)")

    if a.judge_prompt:
        ch = a.channel or "unspecified"
        Path(a.judge_prompt).write_text(JUDGE_TEMPLATE.format(
            source_url=rules["meta"]["source_url"], channel=ch,
            dials=rules["channels"].get(ch, "n/a"),
            text="\n\n".join(texts.values())))

    sys.exit(1 if any(f.level == "error" for f in all_findings) else 0)


def to_markdown(findings, texts, channel):
    lines = []
    for src, text in texts.items():
        fs = [f for f in findings if f.file == src]
        words = len(re.findall(r"\b\w+\b", text))
        c = {l: sum(f.level == l for f in fs) for l in LEVELS}
        lines.append(f"### {src}\n")
        lines.append(f"{words} words · channel: {channel or 'unspecified'} · "
                     f"{c['error']} errors, {c['warning']} warnings, {c['suggestion']} suggestions\n")
        if not fs:
            lines.append("No findings.\n"); continue
        lines.append("| Line | Level | Rule | Basis | Found | Context |")
        lines.append("|---|---|---|---|---|---|")
        for f in fs:
            ctx = f.context.replace("|", "\\|")
            lines.append(f"| {f.line} | {f.level} | {f.rule} | {f.basis} | {f.match.replace('|','')} | {ctx} |")
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    main()
