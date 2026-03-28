import { NextResponse } from 'next/server';
import { extractDependencies } from '@/lib/dep-extractor';

export async function POST(req: Request) {
  try {
    const { files, language } = await req.json();

    if (!Array.isArray(files) || files.length === 0 || !language) {
      return NextResponse.json({ error: 'Files and language are required' }, { status: 400 });
    }

    const graph = await extractDependencies(files, language);

    return NextResponse.json({ graph });
  } catch (error: any) {
    console.error("Error generating deps graph:", error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
