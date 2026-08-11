import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import WorkflowNodeComponent from "../nodes/WorkflowNodeComponent";
import type { Workflow, WorkflowEdge, WorkflowNode } from "../../types/workflow";
import { NODE_COLORS } from "../../types/workflow";

const nodeTypes = { workflow: WorkflowNodeComponent };

function toFlowNodes(nodes: WorkflowNode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: "workflow",
    position: n.position,
    data: { label: n.label, nodeType: n.type },
  }));
}

function toFlowEdges(edges: WorkflowEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: "#3d4f66" },
    labelStyle: { fill: "#a89f94", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" },
  }));
}

interface Props {
  workflow: Workflow;
  onChange?: (workflow: Workflow) => void;
  readOnly?: boolean;
}

export default function WorkflowCanvas({ workflow, onChange, readOnly = false }: Props) {
  const initialNodes = useMemo(() => toFlowNodes(workflow.nodes), [workflow.nodes]);
  const initialEdges = useMemo(() => toFlowEdges(workflow.edges), [workflow.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(toFlowNodes(workflow.nodes));
    setEdges(toFlowEdges(workflow.edges));
  }, [workflow.id, workflow.nodes, workflow.edges, setNodes, setEdges]);

  const syncBack = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      if (!onChange) return;
      onChange({
        ...workflow,
        nodes: updatedNodes.map((n) => {
          const original = workflow.nodes.find((wn) => wn.id === n.id);
          return {
            id: n.id,
            type: original?.type ?? "action",
            label: (n.data.label as string) ?? original?.label ?? "Node",
            config: original?.config ?? {},
            position: n.position,
          };
        }),
        edges: updatedEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label as string | undefined,
        })),
      });
    },
    [onChange, workflow],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;
      setEdges((eds) => {
        const next = addEdge({ ...connection, animated: true, style: { stroke: "#5a554e" } }, eds);
        syncBack(nodes, next);
        return next;
      });
    },
    [readOnly, nodes, setEdges, syncBack],
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (_, node) => {
      if (readOnly) return;
      const updated = nodes.map((n) => (n.id === node.id ? node : n));
      syncBack(updated, edges);
    },
    [readOnly, nodes, edges, syncBack],
  );

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl border border-border overflow-hidden bg-ink">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background color="#2f2c28" gap={24} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => NODE_COLORS[(n.data?.nodeType as keyof typeof NODE_COLORS) ?? "action"]}
          maskColor="rgba(20, 18, 16, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
