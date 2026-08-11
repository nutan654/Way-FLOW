import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Code, Download, Loader2, MapPin, Link2 } from "lucide-react";
import ShareModal from "../components/ShareModal";
import { api } from "../api/client";
import { useWorkflowStore } from "../stores/workflowStore";

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n\n/g, "<br/>");
}

export default function ExportPage() {
  const { workflow, docs, tests, setDocs, setTests, loading, setLoading, setError, error } =
    useWorkflowStore();
  const [activeTab, setActiveTab] = useState<"docs" | "tests" | "json">("docs");
  const [showShare, setShowShare] = useState(false);

  const generateDocs = async () => {
    if (!workflow) return;
    setLoading(true);
    setError(null);
    try {
      const { markdown } = await api.generateDocs(workflow);
      setDocs(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Doc generation failed");
    } finally {
      setLoading(false);
    }
  };

  const generateTests = async () => {
    if (!workflow) return;
    setLoading(true);
    setError(null);
    try {
      const { code } = await api.generateTests(workflow);
      setTests(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test generation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!workflow) return;
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!workflow) {
    return (
      <div className="wf-empty">
        <MapPin className="w-10 h-10 text-cream-dim mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-cream mb-2">Nothing to ship</h2>
        <Link to="/create" className="text-brand-400 hover:text-brand-300 text-sm">
          Map a process first →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      <div className="mb-8">
        <span className="font-mono text-xs text-brand-400 tracking-widest uppercase">Step 04</span>
        <h1 className="wf-page-title mt-2">Ship it</h1>
        <p className="wf-page-sub">Documentation, tests, and workflow JSON — ready to hand off</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={generateDocs}
          disabled={loading}
          className="wf-btn wf-btn-secondary text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Generate docs
        </button>
        <button
          onClick={generateTests}
          disabled={loading}
          className="wf-btn wf-btn-secondary text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
          Generate tests
        </button>
        <button onClick={downloadJson} className="wf-btn wf-btn-primary text-sm">
          <Download className="w-4 h-4" />
          Download JSON
        </button>
        {workflow.id && (
          <button onClick={() => setShowShare(true)} className="wf-btn wf-btn-secondary text-sm">
            <Link2 className="w-4 h-4" />
            Share link
          </button>
        )}
      </div>

      {error && <div className="wf-error mb-5">{error}</div>}

      <div className="flex gap-1 mb-4 border-b border-border">
        {(["docs", "tests", "json"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-mono transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-brand-400 text-brand-300"
                : "border-transparent text-cream-dim hover:text-cream"
            }`}
          >
            {tab === "json" ? "workflow.json" : tab}
          </button>
        ))}
      </div>

      <div className="wf-panel p-6 min-h-[400px]">
        {activeTab === "docs" && (
          docs ? (
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(docs) }}
            />
          ) : (
            <p className="text-cream-dim text-sm font-mono">Generate docs to preview here.</p>
          )
        )}
        {activeTab === "tests" && (
          tests ? (
            <pre className="code-preview !border-0 !bg-transparent !p-0">{tests}</pre>
          ) : (
            <p className="text-cream-dim text-sm font-mono">Generate tests to preview here.</p>
          )
        )}
        {activeTab === "json" && (
          <pre className="code-preview !border-0 !bg-transparent !p-0">{JSON.stringify(workflow, null, 2)}</pre>
        )}
      </div>

      {showShare && workflow.id && (
        <ShareModal workflowId={workflow.id} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
