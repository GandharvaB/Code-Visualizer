import { NextResponse } from 'next/server';
import { createParser } from '@/lib/parsers/loader';
import { buildFlowchartIR } from '@/lib/ast-to-ir';
import { generateMermaid } from '@/lib/ir-to-mermaid';

export async function POST(req: Request) {
  try {
    const { code, language, direction = 'TD' } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    const parser = await createParser(language);
    if (!parser) {
      return NextResponse.json({ error: `Could not load parser for ${language}` }, { status: 400 });
    }

    const tree = parser.parse(code);
    const ir = buildFlowchartIR(tree.rootNode);
    const mermaid = generateMermaid(ir, direction as "TD"|"LR"|"BT"|"RL");

    // Serialize tree for AST explorer
    const astRaw = tree.rootNode.toString();

    return NextResponse.json({ mermaid, ir, astRaw });
  } catch (error: any) {
    console.error("Error generating flowchart:", error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
