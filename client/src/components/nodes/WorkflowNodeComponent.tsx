import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NODE_COLORS, NODE_LABELS, type NodeType } from "../../types/workflow";

function WorkflowNodeComponent({ data, selected }: NodeProps) {
  const nodeType = data.nodeType as NodeType;
  const color = NODE_COLORS[nodeType] ?? "#8a8278";
  const typeLabel = NODE_LABELS[nodeType] ?? nodeType;

  return (
    <div
      className={`min-w-[170px] rounded-xl border-2 bg-surface shadow-lg transition-shadow ${
        selected ? "shadow-[0_0_20px_rgba(223,162,74,0.25)]" : ""
      }`}
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Top} className="!bg-border-light !w-2 !h-2 !border-0" />
      <div className="px-3 py-1.5 border-b border-border" style={{ backgroundColor: `${color}18` }}>
        <div
          className="text-[10px] uppercase tracking-widest font-medium font-mono"
          style={{ color }}
        >
          {typeLabel}
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="font-medium text-cream text-sm">{data.label as string}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-border-light !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(WorkflowNodeComponent);
