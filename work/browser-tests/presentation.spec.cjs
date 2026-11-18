const {test,expect}=require('@playwright/test');
test('previews start still, explicit controls and disclosure describe their behavior',async({page})=>{
 const media=[];page.on('request',r=>{if(/vid2tab\/.*\.(mp4|gif)/.test(r.url()))media.push(r.url())});
 await page.goto('/');
 const real=page.locator('#vid2tab-demo');const sample=page.locator('[data-demo="race"]');
 await expect(real.getByRole('button',{name:'Play Vid2Tab demo',exact:true})).toBeVisible();
 await expect(sample.getByRole('button',{name:'Play TeachLA preview',exact:true})).toBeVisible();
 await sample.scrollIntoViewIfNeeded();expect(media).toEqual([]);
 const canvas=sample.locator('canvas');const still=await canvas.evaluate(c=>c.toDataURL());
 await page.waitForTimeout(150);expect(await canvas.evaluate(c=>c.toDataURL())).toBe(still);
 await sample.getByRole('button',{name:'Play TeachLA preview',exact:true}).click();
 await expect(sample.getByRole('button',{name:'Pause TeachLA preview',exact:true})).toHaveText('Pause');
 await expect.poll(()=>canvas.evaluate(c=>c.toDataURL())).not.toBe(still);
 await sample.getByRole('button',{name:'Pause TeachLA preview',exact:true}).click();
 const details=page.locator('#teachla').getByRole('button',{name:/Project details|Close details/});
 await details.focus();await page.keyboard.press('Enter');
 await expect(details).toHaveAttribute('aria-expanded','true');await expect(details).toHaveText('Close details −');
 await expect(page.locator('#teachla-details')).toBeVisible();await details.click();await expect(details).toHaveText('Project details +');
 await real.scrollIntoViewIfNeeded();expect(media).toEqual([]);
});
test('shared frames reserve room for controls and scale to varied projects',async({page})=>{
 await page.goto('/');
 for(const width of [1280,768,390]){
  await page.setViewportSize({width,height:900});
  for(const id of ['#vid2tab','#teachla']){
   const row=page.locator(id);const stage=await row.locator('.preview-stage').boundingBox();const control=await row.locator('.pause').boundingBox();const frame=await row.locator('.media').boundingBox();
   expect(control.y).toBeGreaterThanOrEqual(stage.y+stage.height);expect(control.width).toBeGreaterThanOrEqual(72);expect(control.height).toBeGreaterThanOrEqual(44);
   expect(stage.x-frame.x).toBeGreaterThanOrEqual(16);await expect(row.locator('.project-preview figcaption')).toBeVisible();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 }
 // Clearly labeled fixtures exercise layout only, never published content.
 await page.evaluate(()=>{const source=document.querySelector('#teachla');for(const [i,color] of ['#101010','#ef3340','#ffffff','#d7e4c7'].entries()){const clone=source.cloneNode(true);clone.id='fixture-'+i;clone.querySelector('h2').textContent='Design fixture: a longer project title '+i;clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));const stage=clone.querySelector('.preview-stage');stage.replaceChildren();stage.style.background=color;source.after(clone)}});
 expect(await page.locator('article.project').count()).toBe(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('native details remain available without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:63219/');
 for(const id of ['#vid2tab-details','#teachla-details']){const details=page.locator(id);await details.locator('summary').click();await expect(details).toHaveAttribute('open','');}
 await expect(page.getByRole('link',{name:'Watch the Vid2Tab demo'})).toBeVisible();await expect(page.locator('.pause:visible')).toHaveCount(0);await context.close();
});
