import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Briefcase, Copy, LayoutTemplate, Loader2, Rocket } from "lucide-react";
import { api, type TemplateSummary } from "../api/client";
import { useWorkflowStore } from "../stores/workflowStore";

const ICONS: Record<string, typeof Briefcase> = {
  briefcase: Briefcase,
  book: BookOpen,
  rocket: Rocket,
};

export default function Templates() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setWorkflow } = useWorkflowStore();

  useEffect(() => {
    api.getTemplates()
      .then(setTemplates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cloneTemplate = async (id: string) => {
    setCloning(id);
    setError(null);
    try {
      const template = await api.getTemplate(id);
      const saved = await api.createWorkflow(template.workflow);
      setWorkflow(saved);
      navigate("/editor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clone failed");
    } finally {
      setCloning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      <div className="mb-10">
        <span className="font-mono text-xs text-brand-400 tracking-widest uppercase">Starter kits</span>
        <h1 className="wf-page-title mt-2">Template gallery</h1>
        <p className="wf-page-sub">
          Flows built for student life — internships, submissions, hackathons. Clone one and adapt it in the editor.
        </p>
      </div>

      {error && <div className="wf-error mb-6">{error}</div>}

      <div className="grid md:grid-cols-3 gap-5">
        {templates.map((t) => {
          const Icon = ICONS[t.icon] ?? LayoutTemplate;
          const isCloning = cloning === t.id;
          return (
            <div
              key={t.id}
              className="wf-card p-6 flex flex-col group hover:border-brand-500/30 transition-all"
              style={{ borderTopColor: t.accent, borderTopWidth: "2px" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${t.accent}18` }}
              >
                <Icon className="w-5 h-5" style={{ color: t.accent }} />
              </div>

              <span className="font-mono text-[10px] uppercase tracking-widest text-cream-dim mb-2">
                {t.category}
              </span>
              <h3 className="font-display text-lg font-bold text-cream mb-2">{t.name}</h3>
              <p className="text-sm text-cream-muted leading-relaxed flex-1 mb-5">{t.description}</p>

              <button
                onClick={() => cloneTemplate(t.id)}
                disabled={isCloning}
                className="wf-btn wf-btn-secondary w-full justify-center text-sm"
              >
                {isCloning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {isCloning ? "Cloning..." : "Clone to editor"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
