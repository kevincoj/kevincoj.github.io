const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFile,mkdtemp,mkdir,writeFile,rm}=require('node:fs/promises');
const os=require('node:os');const path=require('node:path');
const renderer=import('../../scripts/render-content.mjs');

test('edited plain text is escaped in text and attribute contexts',async()=>{
 const {renderTemplate}=await renderer;
 assert.equal(renderTemplate('<p>{{site.intro}}</p><div data-empty="{{site.intro}}"></div>',{site:{intro:'Guitar & "tabs" <script>alert(1)</script>\'s'}}),'<p>Guitar &amp; &quot;tabs&quot; &lt;script&gt;alert(1)&lt;/script&gt;&#39;s</p><div data-empty="Guitar &amp; &quot;tabs&quot; &lt;script&gt;alert(1)&lt;/script&gt;&#39;s"></div>');
});
test('edited technology tags render as individual escaped items',async()=>{
 const {renderTemplate}=await renderer;
 assert.equal(renderTemplate('<ul>{{vid2tab.tags}}</ul>',{vid2tab:{tags:['Python','A&B','<img>']}}),'<ul><li>Python</li><li>A&amp;B</li><li>&lt;img&gt;</li></ul>');
});
test('missing or malformed editor fields fail rather than publish broken text',async()=>{
 const {renderTemplate}=await renderer;
 for(const value of [undefined,null,42,{},'   '])assert.throws(()=>renderTemplate('{{site.intro}}',{site:{intro:value}}),/site.intro/);
 for(const tags of ['Python',[],[null],[''],Array(26).fill('Python')])assert.throws(()=>renderTemplate('{{vid2tab.tags}}',{vid2tab:{tags}}),/vid2tab.tags/);
 assert.throws(()=>renderTemplate('{{site.intro}}',{site:{intro:'a'.repeat(10001)}}),/site.intro/);
});
test('project title edits preserve explicit line breaks and stable page IDs',async()=>{
 const {renderTemplate}=await renderer;
 assert.equal(renderTemplate('<article id="teachla"><h2>{{teachla.title}}</h2></article>',{teachla:{title:'TeachLA\nCoding & learning'}}),'<article id="teachla"><h2>TeachLA<br>Coding &amp; learning</h2></article>');
});
test('content is inserted once even if text contains template syntax',async()=>{
 const {renderTemplate}=await renderer;
 assert.equal(renderTemplate('{{site.intro}}',{site:{intro:'I use {{braces}} in examples.'}}),'I use {{braces}} in examples.');
});
test('build renders every template before overwriting generated output',async()=>{
 const {buildContent}=await renderer;
 const root=await mkdtemp(path.join(os.tmpdir(),'portfolio-content-'));
 try {
  await mkdir(path.join(root,'content'));await mkdir(path.join(root,'templates'));await mkdir(path.join(root,'outputs/portfolio-preview'),{recursive:true});
  for(const name of ['site','vid2tab','teachla'])await writeFile(path.join(root,`content/${name}.json`),JSON.stringify({intro:'New copy'}));
  await writeFile(path.join(root,'templates/index.html'),'<p>{{site.intro}}</p>');
  await writeFile(path.join(root,'templates/crosswords.html'),'<p>{{site.missing}}</p>');
  await writeFile(path.join(root,'outputs/portfolio-preview/index.html'),'Last good output');
  await assert.rejects(buildContent(root),/site.missing/);
  assert.equal(await readFile(path.join(root,'outputs/portfolio-preview/index.html'),'utf8'),'Last good output');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('story paragraphs preserve breaks and escape pasted markup',async()=>{
 const {renderTemplate}=await renderer;
 assert.equal(renderTemplate('{{vid2tab.why_body}}',{vid2tab:{why_body:'First & second.\n\n<script>bad()</script>\n\nLast.'}}),'<p>First &amp; second.</p><p>&lt;script&gt;bad()&lt;/script&gt;</p><p>Last.</p>');
 assert.throws(()=>renderTemplate('{{vid2tab.why_body}}',{vid2tab:{why_body:'  '}}),/vid2tab.why_body/);
});
