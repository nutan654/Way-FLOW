import { useState } from "react";
import { ExternalLink, FileCode, FolderOpen, Search } from "lucide-react";
import GithubIcon from "../components/GithubIcon";
import { CODEBASE_SECTIONS, type CodeFile } from "../data/codebase";
import { GITHUB_REPO_URL, githubFileUrl } from "../config/site";

export default function Source() {
  const [selected, setSelected] = useState<CodeFile>(CODEBASE_SECTIONS[0].files[0]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(CODEBASE_SECTIONS.map((s) => [s.name, true])),
  );

  const filtered = CODEBASE_SECTIONS.map((section) => ({
    ...section,
    files: section.files.filter(
      (f) =>
        !query ||
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.path.toLowerCase().includes(query.toLowerCase()) ||
        f.summary.toLowerCase().includes(query.toLowerCase()) ||
        f.tags?.some((t) => t.includes(query.toLowerCase())),
    ),
  })).filter((s) => s.files.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs text-brand-400 tracking-widest uppercase">Under the hood</span>
          <h1 className="wf-page-title mt-2">Source guide</h1>
          <p className="wf-page-sub max-w-xl">
            Every file in the Wayflow repo, what it does, and how the pieces connect.
          </p>
        </div>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="wf-btn wf-btn-primary shrink-0"
        >
          <GithubIcon className="w-4 h-4" />
          View on GitHub
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-dim" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files, paths, or tags..."
          className="wf-input !pl-10"
        />
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* File tree */}
        <div className="wf-panel p-3 max-h-[70vh] overflow-y-auto">
          {filtered.map((section) => (
            <div key={section.name} className="mb-3 last:mb-0">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [section.name]: !e[section.name] }))}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-lg hover:bg-surface-2 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="font-mono text-xs text-cream font-medium">{section.name}</span>
                <span className="text-cream-dim text-[10px] ml-auto">{section.files.length}</span>
              </button>

              {expanded[section.name] && (
                <div className="mt-1 ml-2 border-l border-border pl-2 space-y-0.5">
                  {section.files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelected(file)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        selected.path === file.path
                          ? "bg-brand-600/15 text-brand-300 border border-brand-600/25"
                          : "text-cream-muted hover:text-cream hover:bg-surface-2 border border-transparent"
                      }`}
                    >
                      <span className="font-mono">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* File detail */}
        <div className="wf-panel p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold text-cream truncate">{selected.name}</h2>
                <p className="font-mono text-xs text-cream-dim truncate">{selected.path}</p>
              </div>
            </div>
            <a
              href={githubFileUrl(selected.path)}
              target="_blank"
              rel="noopener noreferrer"
              className="wf-btn wf-btn-secondary text-xs !py-2 !px-3 shrink-0"
            >
              Open in GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-cream text-base mb-4 leading-relaxed">{selected.summary}</p>
          <p className="text-cream-muted text-sm leading-relaxed mb-6">{selected.details}</p>

          {selected.tags && selected.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 border border-border text-cream-dim"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* How it fits */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-cream-dim mb-3">
              How it fits
            </h3>
            <FlowHint path={selected.path} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowHint({ path }: { path: string }) {
  const hints: Record<string, string> = {
    "client/src/pages/Create.tsx":
      "User types here → api/client.ts sends POST /api/ai/parse → aiService.ts calls GPT or keyword parser → workflow saved via workflows.ts → Editor loads it.",
    "client/src/pages/Editor.tsx":
      "Reads workflow from Zustand store → WorkflowCanvas renders nodes → changes sync back → Save hits PUT /api/workflows/:id.",
    "client/src/pages/Simulate.tsx":
      "Sends workflow + JSON input → simulation.ts → engine.ts walks the graph → SimulationPanel shows the trail.",
    "client/src/pages/Export.tsx":
      "Calls /api/ai/document and /api/ai/tests → aiService generates markdown and Vitest code → download JSON locally.",
    "server/src/services/aiService.ts":
      "Central AI layer. All three AI features go through here. Falls back gracefully when no OpenAI key is set.",
    "server/src/services/engine.ts":
      "Pure logic — no HTTP, no AI calls. Deterministic simulation used by both the API and unit tests.",
    "client/src/stores/workflowStore.ts":
      "Glue between pages. Create sets the workflow; Editor, Simulate, and Export all read from the same store.",
    "server/src/schema/workflow.ts":
      "Single source of truth for workflow shape. Zod validates AI output before saving or simulating.",
  };

  const hint =
    hints[path] ??
    "Part of the Wayflow monorepo. See docs/ARCHITECTURE.md for the full system diagram.";

  return <p className="text-sm text-cream-muted leading-relaxed">{hint}</p>;
}
