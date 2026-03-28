import type Parser from 'web-tree-sitter';

export type FlowNode = {
  id: string;
  type: "start" | "end" | "decision" | "block" | "loop" | "exception" | "async" | "call" | "terminal";
  label: string;
  lineStart: number;
  lineEnd: number;
};

export type FlowEdge = {
  from: string;
  to: string;
  label?: string;
  type: "normal" | "true" | "false" | "exception" | "loop-back";
};

export type FlowchartIR = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export function buildFlowchartIR(node: any): FlowchartIR {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  let idCounter = 0;

  function genId() {
    return `N${idCounter++}`;
  }

  function addNode(type: FlowNode["type"], label: string, tsNode: any) {
    const fnNode = {
      id: genId(),
      type,
      label,
      lineStart: tsNode.startPosition.row + 1,
      lineEnd: tsNode.endPosition.row + 1,
    };
    nodes.push(fnNode);
    return fnNode;
  }

  function addEdge(from: string, to: string, type: FlowEdge["type"] = "normal", label?: string) {
    edges.push({ from, to, type, label });
  }

  // Find the first main block or function
  let rootNode = node;
  // if language root, try to find first function or class method, or just take root
  const functions = rootNode.descendantsOfType(['function_declaration', 'method_definition', 'function_item', 'arrow_function']);
  if (functions.length > 0) {
    rootNode = functions[0];
  }

  const startNode = addNode("start", "Start " + (rootNode.childForFieldName('name')?.text || 'Flow'), rootNode);
  
  let currentParentId = startNode.id;

  // Simple sequential visitor
  function visit(n: any, parentId: string, edgeType: FlowEdge["type"] = "normal", edgeLabel?: string): string {
    const t = n.type;
    let newParentId = parentId;

    if (t.includes('if_statement') || t === 'if_expression') {
      const condition = n.childForFieldName('condition') || n.children.find((c: any) => c.type === 'binary_expression' || c.type === 'parenthesized_expression') || n;
      const decNode = addNode("decision", `if ${condition.text.slice(0, 30)}?`, condition);
      addEdge(parentId, decNode.id, edgeType, edgeLabel);
      
      const consequence = n.childForFieldName('consequence') || n.childForFieldName('body');
      if (consequence) {
        visit(consequence, decNode.id, "true", "Yes");
      }

      const alternative = n.childForFieldName('alternative') || n.children.find((c: any) => c.type === 'else_clause');
      if (alternative) {
        visit(alternative, decNode.id, "false", "No");
      }
      return decNode.id; // next statements continue from branching (conceptually need a join, simplified here)
    } 
    else if (t.includes('for') || t.includes('while')) {
      const loopNode = addNode("loop", `Loop: ${n.text.slice(0, 20)}`, n);
      addEdge(parentId, loopNode.id, edgeType, edgeLabel);
      const body = n.childForFieldName('body');
      if (body) {
        // loop back edge simplified (loop body points back to loop conceptually)
        const lastNodeInBody = visit(body, loopNode.id, "true", "Iterate");
      }
      return loopNode.id;
    }
    else if (t.includes('try')) {
      const tryNode = addNode("block", "Try Block", n);
      addEdge(parentId, tryNode.id, edgeType, edgeLabel);
      const body = n.childForFieldName('body');
      if (body) visit(body, tryNode.id, "normal");

      for (const child of n.children) {
        if (child.type.includes('catch') || child.type.includes('except')) {
          const catchNode = addNode("exception", "Catch/Except", child);
          addEdge(tryNode.id, catchNode.id, "exception", "Error");
          const catchBody = child.childForFieldName('body');
          if (catchBody) visit(catchBody, catchNode.id, "normal");
        }
      }
      return tryNode.id;
    }
    else if (t.includes('return') || t.includes('break') || t.includes('continue')) {
      const termNode = addNode("terminal", n.text.slice(0, 20), n);
      addEdge(parentId, termNode.id, edgeType, edgeLabel);
      return termNode.id;
    }
    else if (t.includes('await') || n.text.includes('await')) {
       // Just marking await expressions as async calls
       const asyncNode = addNode("async", n.text.slice(0, 30), n);
       addEdge(parentId, asyncNode.id, edgeType, edgeLabel);
       return asyncNode.id;
    }
    else if (t.includes('call') || t.includes('invoke')) {
       const callNode = addNode("call", n.text.slice(0, 30), n);
       addEdge(parentId, callNode.id, edgeType, edgeLabel);
       return callNode.id;
    }
    else if (n.isNamed && (t.includes('statement') || t.includes('declaration')) && !t.includes('block')) {
       const blkNode = addNode("block", n.text.slice(0, 30), n);
       addEdge(parentId, blkNode.id, edgeType, edgeLabel);
       return blkNode.id;
    } else {
      // Just traverse children
      let lastId = parentId;
      for (const child of n.children) {
         if (child.isNamed) {
            const returnedId = visit(child, lastId, "normal");
            // very simplistic linear chain (not true control flow but gives a visual sequence)
            if (returnedId !== lastId) {
                lastId = returnedId;
            }
         }
      }
      return lastId;
    }
  }

  const bodyOfRoot = rootNode.childForFieldName('body') || rootNode;
  const lastId = visit(bodyOfRoot, startNode.id, "normal");
  const endNode = addNode("end", "End", rootNode);
  addEdge(lastId, endNode.id, "normal");

  return { nodes, edges };
}
