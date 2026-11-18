import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const escapeHtml=value=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function text(value,key) {
  if(typeof value!=='string'||!value.trim()||value.length>10000) throw Error(`Invalid content field ${key}: enter 1–10000 characters.`);
  return escapeHtml(value);
}
export function renderTemplate(template,content) {
  return template.replace(/\{\{([a-z][a-z0-9_]*)\.([a-z][a-z0-9_]*)\}\}/g,(_,group,field)=>{
    const key=`${group}.${field}`;
    const value=Object.hasOwn(content,group)&&Object.hasOwn(content[group],field)?content[group][field]:undefined;
    if(key==='vid2tab.tags') {
      if(!Array.isArray(value)||!value.length||value.length>25) throw Error(`Invalid content field ${key}: enter 1–25 tags.`);
      return value.map(tag=>`<li>${text(tag,key)}</li>`).join('');
    }
    const escaped=text(value,key);
    return field==='title'?escaped.replace(/\r?\n/g,'<br>'):escaped;
  });
}
export async function buildContent(root=defaultRoot) {
  const content=Object.fromEntries(await Promise.all(['site','vid2tab','teachla'].map(async name=>[name,JSON.parse(await readFile(path.join(root,`content/${name}.json`),'utf8'))])));
  const pages=await Promise.all(['index','crosswords'].map(async name=>[name,renderTemplate(await readFile(path.join(root,`templates/${name}.html`),'utf8'),content)]));
  // Validate all pages first: a bad field never leaves a partially rendered preview.
  for(const [name,html] of pages) await writeFile(path.join(root,`outputs/portfolio-preview/${name}.html`),html);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  await buildContent();
  console.log('Rendered portfolio text from content/.');
}
