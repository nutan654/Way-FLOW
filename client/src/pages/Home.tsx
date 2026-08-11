import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GithubIcon from "../components/GithubIcon";
import { GITHUB_REPO_URL } from "../config/site";

const features = [
  {
    num: "01",
    title: "Describe in words",
    description: "Write how your process works — no syntax, no drag-and-drop yet. Just plain language.",
    span: "col-span-1",
  },
  {
    num: "02",
    title: "See the path",
    description: "AI maps your description into a visual flow — nodes, branches, and decision points laid out like a route.",
    span: "col-span-1",
  },
  {
    num: "03",
    title: "Walk through it",
    description: "Simulate with real test data. Watch each step execute and catch logic gaps before you ship.",
    span: "col-span-1",
  },
  {
    num: "04",
    title: "Ship with docs",
    description: "Export workflow JSON, auto-generated documentation, and Vitest test cases — ready for your team.",
    span: "col-span-1",
  },
];

function HeroPath() {
  return (
    <svg viewBox="0 0 400 320" className="w-full max-w-md mx-auto" aria-hidden>
      <defs>
        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Background grid lines */}
      {[80, 160, 240].map((y) => (
        <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="#243044" strokeWidth="0.5" strokeDasharray="4 8" />
      ))}

      {/* Main flowing path */}
      <path
        d="M 40 260 C 80 260, 100 80, 200 80 C 300 80, 320 260, 360 260"
        stroke="url(#pathGrad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        className="wf-path-animate"
      />

      {/* Nodes */}
      {[
        { cx: 40, cy: 260, label: "Trigger", color: "#34d399", delay: "0s" },
        { cx: 200, cy: 80, label: "Classify", color: "#38bdf8", delay: "0.4s" },
        { cx: 280, cy: 170, label: "Branch", color: "#a78bfa", delay: "0.8s" },
        { cx: 360, cy: 260, label: "Action", color: "#60a5fa", delay: "1.2s" },
      ].map(({ cx, cy, label, color, delay }) => (
        <g key={label}>
          <circle
            cx={cx}
            cy={cy}
            r="18"
            fill="#0c1018"
            stroke={color}
            strokeWidth="2"
            className="wf-node-pulse"
            style={{ animationDelay: delay }}
          />
          <text
            x={cx}
            y={cy + 34}
            textAnchor="middle"
            fill="#8b9cb3"
            fontSize="11"
            fontFamily="IBM Plex Mono, monospace"
          >
            {label}
          </text>
        </g>
      ))}

      {/* Decorative compass rose */}
      <g transform="translate(340, 30)" opacity="0.4">
        <circle r="16" fill="none" stroke="#243044" strokeWidth="1" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="#38bdf8" strokeWidth="1" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#243044" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-16">
      {/* Hero — asymmetric split */}
      <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 md:mb-28">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand-400 mb-5">
            Process cartography
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-cream leading-[1.08] tracking-tight mb-6">
            Every process
            <br />
            has a{" "}
            <span className="text-brand-400 italic font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
              way
            </span>
            <br />
            through it.
          </h1>
          <p className="text-cream-muted text-lg leading-relaxed mb-8 max-w-md">
            Wayflow turns messy operational descriptions into clear, runnable paths —
            then lets you walk through them before they go live.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/create" className="wf-btn wf-btn-primary text-base px-7 py-3">
              Start mapping
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/templates" className="wf-btn wf-btn-secondary text-base px-7 py-3">
              Browse templates
            </Link>
          </div>
        </div>

        <div className="wf-card p-6 md:p-8 bg-surface/80">
          <HeroPath />
        </div>
      </section>

      {/* Example template — horizontal strip */}
      <section className="mb-20">
        <div className="wf-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 border-brand-600/20 bg-gradient-to-r from-brand-600/5 to-transparent">
          <div className="flex-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-sage-400 mb-2 block">
              Try it now
            </span>
            <h2 className="font-display text-xl font-bold text-cream mb-2">
              Customer Support Triage
            </h2>
            <p className="text-cream-muted text-sm leading-relaxed">
              New ticket → AI classifies urgency → Slack alert if high → auto-reply FAQ if low →
              escalate after 2 hours with no response.
            </p>
          </div>
          <Link
            to="/create"
            className="wf-btn wf-btn-secondary shrink-0 self-start md:self-center"
          >
            Use this template
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features — numbered bento */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold text-cream mb-8">
          Four steps from idea to shipped
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map(({ num, title, description }) => (
            <div key={num} className="wf-card p-6 group">
              <span className="font-mono text-brand-400 text-sm mb-3 block">{num}</span>
              <h3 className="font-display text-lg font-bold text-cream mb-2">{title}</h3>
              <p className="text-sm text-cream-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-cream-dim font-mono pt-8 border-t border-border">
        <span>Full-stack portfolio project</span>
        <span className="hidden sm:inline text-border">·</span>
        <Link to="/source" className="hover:text-brand-400 transition-colors">
          Explore the codebase →
        </Link>
        <span className="hidden sm:inline text-border">·</span>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-brand-400 transition-colors"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          GitHub
        </a>
      </footer>
    </div>
  );
}
