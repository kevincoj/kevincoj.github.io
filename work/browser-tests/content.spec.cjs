const {test,expect}=require('@playwright/test');
const {mkdtemp,cp,mkdir,readFile,writeFile,rm}=require('node:fs/promises');
const path=require('node:path');const os=require('node:os');

test('CMS-style text edits reach generated pages and survive crossword initialization',async({page})=>{
 const {buildContent}=await import('../../scripts/render-content.mjs');
 const root=await mkdtemp(path.join(os.tmpdir(),'portfolio-browser-content-'));
 try{
  const repo=path.resolve(__dirname,'../..');
  await cp(path.join(repo,'content'),path.join(root,'content'),{recursive:true});
  await cp(path.join(repo,'templates'),path.join(root,'templates'),{recursive:true});
  await mkdir(path.join(root,'outputs/portfolio-preview'),{recursive:true});
  const site=JSON.parse(await readFile(path.join(root,'content/site.json'),'utf8'));
  site.intro='I build guitar tools & puzzles <script>throw Error("bad")</script>';
  site.crossword_empty_intro='My puzzles are still in the works.';
  site.crossword_empty_status='Nothing published here yet.';
  site.crossword_collection_note='I’m making the first puzzle.';
  await writeFile(path.join(root,'content/site.json'),JSON.stringify(site));
  const project=JSON.parse(await readFile(path.join(root,'content/vid2tab.json'),'utf8'));
  project.title='My guitar project';project.tags=['Python','A&B'];
  await writeFile(path.join(root,'content/vid2tab.json'),JSON.stringify(project));
  await buildContent(root);
  const index=await readFile(path.join(root,'outputs/portfolio-preview/index.html'),'utf8');
  const crosswords=await readFile(path.join(root,'outputs/portfolio-preview/crosswords.html'),'utf8');
  await page.route('http://127.0.0.1:63219/',route=>route.fulfill({body:index,contentType:'text/html'}));
  await page.goto('/');
  await expect(page.locator('.portfolio-intro>p')).toHaveText(site.intro);
  await expect(page.locator('.portfolio-intro script')).toHaveCount(0);
  await expect(page.locator('#vid2tab').getByRole('heading',{level:2})).toHaveText('My guitar project');
  await expect(page.locator('#vid2tab .tech-tags li')).toHaveText(['Python','A&B']);
  await expect(page.locator('#vid2tab video')).toHaveAttribute('data-src','assets/projects/vid2tab/demo.mp4');
  await page.route('**/crosswords.html',route=>route.fulfill({body:crosswords,contentType:'text/html'}));
  await page.goto('/crosswords.html');
  await expect(page.locator('#puz-message')).toHaveText('Nothing published here yet.');
  await expect(page.locator('#crossword-intro')).toHaveText('My puzzles are still in the works.');
  await expect(page.locator('#library-note')).toHaveText('I’m making the first puzzle.');
 }finally{await rm(root,{recursive:true,force:true});}
});
