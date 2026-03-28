import { FlowchartIR, FlowNode, FlowEdge } from './ast-to-ir';

function sanitizeLabel(label: string): string {
  // Mermaid is sensitive to quotes, brackets, and newlines in labels
  return label
    .replace(/"/g, "'")
    .replace(/[\[\]]/g, "")
    .replace(/\n/g, " ")
    .replace(/[{}()]/g, " ")
    .trim();
}

function getNodeShape(node: FlowNode): string {
  const safeLabel = sanitizeLabel(node.label);
  switch (node.type) {
    case "start":
    case "end":
    case "terminal":
      return `${node.id}(["${safeLabel}"])`; // pill
    case "decision":
      return `${node.id}{"${safeLabel}"}`; // diamond
    case "loop":
      return `${node.id}[["${safeLabel}"]]`; // sub-process looking for loop
    case "async":
    case "call":
      return `${node.id}[/"${safeLabel}"\\]`; // parallelogram for calls/async
    case "exception":
      return `${node.id}>"${safeLabel}"]`; // flag
    case "block":
    default:
      return `${node.id}["${safeLabel}"]`; // standard rectangle
  }
}

function getEdgeLine(edge: FlowEdge): string {
  const safeLabel = edge.label ? `|"${sanitizeLabel(edge.label)}"|` : "";
  switch (edge.type) {
    case "true":
      return `-->${safeLabel}`; // True paths
    case "false":
      return `-.->${safeLabel}`; // False paths (dotted)
    case "exception":
      return `==>${safeLabel}`; // thick path for exceptions
    case "loop-back":
      return `-.->${safeLabel}`;
    case "normal":
    default:
      return `-->${safeLabel}`;
  }
}

export function generateMermaid(ir: FlowchartIR, direction: "TD" | "LR" | "BT" | "RL" = "TD"): string {
  let mermaid = `flowchart ${direction}\n`;

  // Draw nodes
  for (const node of ir.nodes) {
    mermaid += `  ${getNodeShape(node)}\n`;
  }

  // Draw edges
  for (const edge of ir.edges) {
    const fromId = edge.from;
    const toId = edge.to;
    if (fromId && toId) {
      mermaid += `  ${fromId} ${getEdgeLine(edge)} ${toId}\n`;
    }
  }

  // Add click callbacks if needed (Mermaid syntax: click nodeId call function())
  // In React Flow/Mermaid-js we can use the graph click event if supported.
  
  return mermaid;
}
