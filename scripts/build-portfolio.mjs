import {cp,mkdir,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'outputs/portfolio-preview');
const destination=path.join(root,'dist');
// Only the website runtime files are staged; repository docs, tests and secrets stay outside dist.
await rm(destination,{recursive:true,force:true});
await mkdir(destination,{recursive:true});
await cp(source,destination,{recursive:true,filter:p=>path.basename(p)!=='README.md'});
const html=await readFile(path.join(destination,'index.html'),'utf8');
if(!html.includes('id="vid2tab"'))throw Error('The build is missing the featured project.');
console.log('Built static portfolio in dist/ with Vid2Tab media.');
