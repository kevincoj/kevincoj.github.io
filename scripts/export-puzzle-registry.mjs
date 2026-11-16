import path from 'node:path';import {pathToFileURL} from 'node:url';
import catalog from '../outputs/portfolio-preview/crossword-catalog.js';
import {validatePublishedFiles} from './validate-puzzles.mjs';
export function registrySQL(rows) {
  catalog.validateCatalog(rows);
  if(!rows.length)return '-- Empty catalog: no puzzle IDs to register. No changes made.\n';
  const values=rows.map(p=>`('${p.id}','${p.revision}',true)`).join(',\n');
  return `-- Review before applying. Removing a puzzle from the catalog does not unpublish it here.\nbegin;\ninsert into public.crossword_puzzles(id,revision,published) values\n${values}\non conflict(id) do update set revision=excluded.revision,published=excluded.published;\ncommit;\n`;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try{console.log(registrySQL(await validatePublishedFiles(process.argv[2])));}catch(e){console.error(e.message);process.exitCode=1;}
}
