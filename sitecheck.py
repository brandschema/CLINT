#!/usr/bin/env python3
"""Cross-page checks: claim register and term consistency across a set of pages.
Usage: python sitecheck.py URL [URL ...] [--claims rules/monzo-claims.yml] [--rules rules/monzo.yml]"""
import argparse, re, yaml
from pathlib import Path
import clint as lint

ap = argparse.ArgumentParser()
ap.add_argument("inputs", nargs="+")
ap.add_argument("--claims", default="rules/monzo-claims.yml")
ap.add_argument("--rules", default="rules/monzo.yml")
a = ap.parse_args()
claims = yaml.safe_load(open(a.claims))["claims"]
rules = yaml.safe_load(open(a.rules))
texts = {u: lint.norm_quotes(lint.load_text(u)) for u in a.inputs}
WORDNUM = {"three": "3", "five": "5", "ten": "10"}

print("## Claim register\n")
print("| Claim | Value | Where | Status |\n|---|---|---|---|")
for c in claims:
    seen = {}
    for u, t in texts.items():
        for m in re.finditer(c["pattern"], t, re.I):
            v = WORDNUM.get(m.group(1).lower(), m.group(1))
            ln = t.count("\n", 0, m.start()) + 1
            seen.setdefault(v, []).append(f"{u.replace('https://','')} (line {ln})")
    if not seen:
        continue
    status = "CONFLICT" if len(seen) > 1 else ("matches confirmed" if c["confirmed"] == list(seen)[0] else "consistent, unconfirmed")
    if c["confirmed"] and any(v != c["confirmed"] for v in seen):
        status = "DIFFERS FROM CONFIRMED"
    for v, where in seen.items():
        print(f"| {c['label']} | {v} | {'; '.join(where)} | {status} |")

print("\n## Term spellings across pages\n")
cons = next(r for r in rules["rules"] if r["id"] == "Consistency")
for term in cons["terms"]:
    pat = re.compile(r"\b" + re.escape(term).replace(r"\ ", r"[\s&-]+").replace("and", "(?:and|&)") + r"s?\b", re.I)
    variants = {}
    for u, t in texts.items():
        for m in pat.finditer(t):
            at_start = m.start() == 0 or t[m.start()-1] == "\n" or t[max(0, m.start()-2):m.start()] in (". ", "? ", "! ")
            v = (m.group(0)[:-1] if m.group(0).lower().endswith("s") and not term.lower().endswith("s") else m.group(0))
            if at_start and v[1:] in {k[1:] for k in variants}:
                continue
            variants.setdefault(v, set()).add(u.replace("https://", ""))
    if len(variants) > 1:
        print(f"- **{term}**: " + "; ".join(f"'{v}' ({', '.join(sorted(p))})" for v, p in variants.items()))
