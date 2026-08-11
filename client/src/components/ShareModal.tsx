import { useState } from "react";
import { Check, Copy, Link2, X } from "lucide-react";
import { api } from "../api/client";

interface Props {
  workflowId: string;
  onClose: () => void;
}

export default function ShareModal({ workflowId, onClose }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { shareUrl: url } = await api.createShareLink(workflowId);
      setShareUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
      <div className="wf-panel w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-brand-400" />
            <h2 className="font-display text-lg font-bold text-cream">Share workflow</h2>
          </div>
          <button onClick={onClose} className="text-cream-dim hover:text-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-cream-muted mb-5">
          Anyone with this link can view the workflow in read-only mode — no account needed.
        </p>

        {!shareUrl ? (
          <button onClick={generate} disabled={loading} className="wf-btn wf-btn-primary w-full justify-center">
            {loading ? "Generating..." : "Create public link"}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input readOnly value={shareUrl} className="wf-input wf-input-mono text-xs flex-1" />
              <button onClick={copy} className="wf-btn wf-btn-secondary !px-3">
                {copied ? <Check className="w-4 h-4 text-sage-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-cream-dim font-mono">Link stays active until you revoke it.</p>
          </div>
        )}

        {error && <div className="wf-error mt-4">{error}</div>}
      </div>
    </div>
  );
}
