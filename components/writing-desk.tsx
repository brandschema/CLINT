"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Markdown from "react-markdown";
import { MAX_DRAFT_CHARACTERS } from "@/lib/limits";

function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

export function WritingDesk() {
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [submittedDraft, setSubmittedDraft] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordCount = draft.trim() ? draft.trim().split(/\s+/u).length : 0;
  const tooLong = draft.length > MAX_DRAFT_CHARACTERS;
  const draftChanged = Boolean(result && submittedDraft !== draft);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || !draft.trim() || tooLong) return;

    setIsLoading(true);
    setError("");
    setCopyStatus("");
    setResult("");
    const currentDraft = draft;

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: currentDraft }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "We couldn't finish the rewrite. Please try again.");
      }
      if (typeof data.result !== "string" || !data.result.trim()) {
        throw new Error("We didn't receive a rewrite. Please try again.");
      }
      setResult(data.result);
      setSubmittedDraft(currentDraft);
      requestAnimationFrame(() => outputRef.current?.focus());
    } catch (cause) {
      setError(cause instanceof TypeError ? "We couldn't connect. Your draft is still here. Please try again." : cause instanceof Error ? cause.message : "We couldn't finish the rewrite. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Couldn't copy. Select the result and copy it manually.");
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus(""), 3500);
  }

  function clearDraft() {
    setDraft("");
    setResult("");
    setError("");
    setCopyStatus("");
    textareaRef.current?.focus();
  }

  return (
    <section className="writing-area" aria-label="Rewrite your draft">
      <div className="writing-desk">
        <form className="draft-panel" onSubmit={submitDraft}>
          <div className="panel-heading">
            <label htmlFor="draft" className="panel-title"><span className="step-number">01</span>Your draft</label>
            <button type="button" className="quiet-button" onClick={clearDraft} disabled={!draft || isLoading}>Clear</button>
          </div>
          <textarea
            id="draft"
            name="draft"
            ref={textareaRef}
            value={draft}
            onChange={(event) => { setDraft(event.target.value); setError(""); }}
            readOnly={isLoading}
            placeholder={"An email. A product page. A message that needs a little care.\n\nPaste your words here."}
            aria-describedby="draft-help draft-count"
            aria-invalid={tooLong}
            spellCheck
          />
          <div className="draft-tools">
            <span id="draft-count" className={tooLong ? "draft-count over-limit" : "draft-count"}>{tooLong ? `${draft.length.toLocaleString("en-GB")} / 20,000 characters` : `${wordCount.toLocaleString("en-GB")} ${wordCount === 1 ? "word" : "words"}`}</span>
            <button type="submit" className="rewrite-button" disabled={!draft.trim() || isLoading || tooLong}>
              {isLoading ? <><span className="button-spinner" aria-hidden="true" />Working on it</> : <>Rewrite draft<Arrow /></>}
            </button>
          </div>
        </form>

        <section className="result-panel" aria-labelledby="result-title" aria-busy={isLoading}>
          <div className="panel-heading">
            <h2 id="result-title" className="panel-title"><span className="step-number">02</span>The rewrite</h2>
            {result && <button className="copy-button" type="button" onClick={copyResult}><CopyIcon />{copyStatus === "Copied" ? "Copied" : "Copy result"}</button>}
          </div>
          <div className="result-body" ref={outputRef} tabIndex={-1} aria-label="Rewrite and change notes">
            {result ? (
              <>
                {draftChanged && <p className="changed-notice">You’ve edited your draft. Rewrite it again to update this result.</p>}
                <div className="rewritten-text"><Markdown skipHtml>{result}</Markdown></div>
              </>
            ) : (
              <div className="empty-result">
                <div className={isLoading ? "editor-mark is-loading" : "editor-mark"} aria-hidden="true"><span /><span /><span /></div>
                <p className="empty-title">{isLoading ? "Giving your words a little care." : "Still your message."}</p>
                <p>{isLoading ? "Your rewrite and change notes are on their way." : "A rewrite when it needs one.\nYour original when it doesn’t."}</p>
              </div>
            )}
          </div>
          <div className="result-footnote"><span className="small-dot" />{result ? "Read the rewrite and notes before you use them." : "Your rewrite and change notes will appear here."}</div>
        </section>
      </div>

      <div className="feedback" role="status" aria-live="polite">{isLoading ? "Rewriting your draft." : copyStatus || (result ? "Your result is ready." : "")}</div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {copyStatus.startsWith("Couldn't") && <p className="error-message" role="alert">{copyStatus}</p>}
      {tooLong && <p className="error-message" role="alert">Keep your draft under 20,000 characters to continue.</p>}
      <div className="desk-notes">
        <p id="draft-help">Your draft is sent to OpenAI when you choose Rewrite. CLINT keeps no saved history.</p>
        <p>Checks the writing. Facts, figures and claims still need your review.</p>
      </div>
    </section>
  );
}
