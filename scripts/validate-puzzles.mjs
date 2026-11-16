import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import catalog from '../outputs/portfolio-preview/crossword-catalog.js';
import parser from '../outputs/portfolio-preview/crossword-parser.js';
export async function validatePublishedFiles(root='outputs/portfolio-preview') {
  const rows=catalog.validateCatalog(JSON.parse(await readFile(path.join(root,'puzzle-catalog.json'),'utf8')));
  const realRoot=await realpath(root);
  for(const entry of rows) {
    const file=await realpath(path.join(root,entry.file));
    if(!file.startsWith(realRoot+path.sep))throw Error(`Puzzle asset escapes website root: ${entry.id}`);
    const bytes=await readFile(file);const p=parser.parsePuz(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
    if(!p.answersAvailable)throw Error(`Published puzzle needs unlocked answers: ${entry.id}`);
  }
  return rows;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {const rows=await validatePublishedFiles(process.argv[2]);console.log(`Validated ${rows.length} published puzzles.`);}catch(e){console.error(e.message);process.exitCode=1;}
}
