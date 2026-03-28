import path from 'path';
import fs from 'fs/promises';
const Parser = require('web-tree-sitter');

let parserInitialized = false;

export async function initParser() {
  if (!parserInitialized) {
    await Parser.init({
      locateFile(scriptName: string, scriptDirectory: string) {
        return path.join(process.cwd(), 'public', 'wasm', scriptName);
      },
    });
    parserInitialized = true;
  }
}

export async function getLanguage(langName: string): Promise<any> {
  await initParser();
  
  const wasmPath = path.join(process.cwd(), 'public', 'wasm', `tree-sitter-${langName}.wasm`);
  
  try {
    const language = await Parser.Language.load(wasmPath);
    return language;
  } catch (err) {
    console.error(`Failed to load language ${langName} at ${wasmPath}:`, err);
    return null;
  }
}

export async function createParser(langName: string): Promise<any> {
  const language = await getLanguage(langName);
  if (!language) return null;
  
  const parser = new Parser();
  parser.setLanguage(language);
  return parser;
}
