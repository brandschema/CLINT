import { WritingDesk } from "@/components/writing-desk";
import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="masthead">
        <Link className="wordmark" href="/" aria-label="CLINT home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          CLINT<span className="wordmark-stop">.</span>
        </Link>
        <div className="brand-context"><span className="status-dot" />Writing with Monzo</div>
      </header>

      <section className="introduction" aria-labelledby="page-title">
        <p className="eyebrow">A writing assistant, with a light touch</p>
        <h1 id="page-title">Your words.<br /><span>A little more Monzo.</span></h1>
        <p className="intro-copy">Paste your draft. Get a rewrite in Monzo’s voice,<br className="desktop-break" /> with a note on what changed and why.</p>
      </section>

      <WritingDesk />

      <footer className="site-footer">
        <p>Clear. Kind. Considered.</p>
        <p>CLINT <span aria-hidden="true">/</span> Monzo voice trial</p>
      </footer>
    </main>
  );
}
