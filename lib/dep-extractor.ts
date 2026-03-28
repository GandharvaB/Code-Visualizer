import { createParser } from '@/lib/parsers/loader';
import type Parser from 'web-tree-sitter';

export type DepGraphNode = {
  id: string; // filename
  type: string; // "entry" | "core" | "config" | "tool" | "report"
  data: { label: string, group?: string };
  position?: { x: number, y: number };
};

export type DepGraphEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
};

export async function extractDependencies(files: { name: string; content: string }[], language: string) {
  const parser = await createParser(language);
  if (!parser) throw new Error(`Could not load parser for ${language}`);

  const nodesMap = new Map<string, { incoming: Set<string>, outgoing: Set<string> }>();
  
  for (const file of files) {
    if (!nodesMap.has(file.name)) {
      nodesMap.set(file.name, { incoming: new Set(), outgoing: new Set() });
    }
    
    // Quick heuristic: simple regex before fully parsing to save time or fallback
    // For proper parsing:
    const tree = parser.parse(file.content);
    
    // Find imports based on language
    let imports: string[] = [];
    if (language === 'javascript' || language === 'typescript') {
      const qs = parser.getLanguage().query(`
        (import_statement source: (string) @source)
        (call_expression function: (identifier) @fn arguments: (arguments (string) @source) (#eq? @fn "require"))
      `);
      const matches = qs.matches(tree.rootNode);
      matches.forEach((m: any) => {
        const srcNode = m.captures.find((c: any) => c.name === 'source');
        if (srcNode) {
            const importPath = srcNode.node.text.replace(/['"]/g, '');
            if (importPath.startsWith('.')) {
                // Simplified relative path resolution
                imports.push(importPath);
            }
        }
      });
    } else if (language === 'python') {
      const qs = parser.getLanguage().query(`
        (import_statement name: (dotted_name) @module)
        (import_from_statement module_name: (dotted_name) @module)
      `);
      const matches = qs.matches(tree.rootNode);
      matches.forEach((m: any) => {
        const srcNode = m.captures.find((c: any) => c.name === 'module');
        if (srcNode) imports.push(srcNode.node.text);
      });
    }
    // and other languages... 

    for (const imp of imports) {
        // Very basic resolution for demo
        let resolvedTarget = imp.startsWith('.') ? resolvePath(file.name, imp) : imp;
        
        // Find if target is inside our files
        const targetFile = files.find(f => f.name.includes(resolvedTarget) || f.name.replace(/\.[^/.]+$/, "").endsWith(resolvedTarget));
        
        const actualTarget = targetFile ? targetFile.name : resolvedTarget;
        
        if (!nodesMap.has(actualTarget)) {
            nodesMap.set(actualTarget, { incoming: new Set(), outgoing: new Set() });
        }
        
        nodesMap.get(file.name)!.outgoing.add(actualTarget);
        nodesMap.get(actualTarget)!.incoming.add(file.name);
    }
  }

  // Build the graph
  const nodes: DepGraphNode[] = [];
  const edges: DepGraphEdge[] = [];
  
  nodesMap.forEach((rels, name) => {
      let type = "tool";
      if (rels.incoming.size === 0 && rels.outgoing.size > 0) type = "entry";
      else if (rels.incoming.size > 2) type = "core";
      else if (rels.incoming.size > 0 && rels.outgoing.size === 0) type = "report";
      
      if (name.includes('config') || name.includes('settings')) type = "config";

      const dir = name.split('/').slice(0, -1).join('/');

      nodes.push({
          id: name,
          type: "custom", // React flow specific type
          data: { label: name.split('/').pop() || name, group: dir || "root" }
      });

      rels.outgoing.forEach(target => {
          edges.push({
              id: `${name}->${target}`,
              source: name,
              target: target,
              animated: true
          });
      });
  });

  return { nodes, edges };
}

function resolvePath(baseFile: string, relPath: string): string {
  // A simplistic path resolver for relative imports
  const baseParts = baseFile.split('/').slice(0, -1);
  const relParts = relPath.split('/');
  for (const part of relParts) {
      if (part === '.') continue;
      if (part === '..') baseParts.pop();
      else baseParts.push(part);
  }
  return baseParts.join('/');
}
