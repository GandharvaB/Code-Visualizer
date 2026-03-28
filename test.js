const Parser = require('web-tree-sitter');
const path = require('path');

async function test() {
  await Parser.init({
    locateFile(scriptName, scriptDirectory) {
      return path.join(process.cwd(), 'public', 'wasm', scriptName);
    },
  });

  const wasmPath = path.join(process.cwd(), 'public', 'wasm', `tree-sitter-python.wasm`);
  try {
    const fs = require('fs');
    const bytes = fs.readFileSync(wasmPath);
    console.log("Loaded bytes:", bytes.length);
    const language = await Parser.Language.load(bytes);
    console.log("Loaded language successfully", !!language);
    const parser = new Parser();
    parser.setLanguage(language);
    console.log("Parser ready!");
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
