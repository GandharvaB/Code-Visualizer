import { NextResponse } from 'next/server';
import { createParser } from '@/lib/parsers/loader';
import type Parser from 'web-tree-sitter';

// Simple tree serializer to avoid circular references
function serializeNode(node: any): any {
  return {
    id: String(node.id),
    type: node.type,
    text: node.text.slice(0, 50) + (node.text.length > 50 ? '...' : ''),
    isNamed: node.isNamed,
    startPosition: node.startPosition,
    endPosition: node.endPosition,
    children: node.children.map((c: any) => serializeNode(c)),
  };
}

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();
    if (!code || !language) return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });

    const parser = await createParser(language);
    if (!parser) return NextResponse.json({ error: `Could not load parser for ${language}` }, { status: 400 });

    const tree = parser.parse(code);
    const serializedAST = serializeNode(tree.rootNode);

    return NextResponse.json({ ast: serializedAST, raw: tree.rootNode.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
