const {test,expect}=require('@playwright/test');
test('Pause preserves the selected video frame and Resume continues',async({page})=>{
 await page.goto('/');const panel=page.locator('[data-project-media]');const video=panel.locator('video');
 await expect(panel.getByRole('button',{name:'Play Vid2Tab demo',exact:true})).not.toHaveAttribute('aria-pressed',/./);
 await panel.getByRole('button',{name:'Play Vid2Tab demo',exact:true}).click();
 await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(.2);
 await panel.getByRole('button',{name:'Pause Vid2Tab demo',exact:true}).click();
 await expect(video).toBeVisible();await expect(video).toHaveJSProperty('paused',true);await expect(panel.locator('.project-poster')).toBeHidden();
 const time=await video.evaluate(v=>v.currentTime);await page.waitForTimeout(150);expect(await video.evaluate(v=>v.currentTime)).toBeCloseTo(time,1);
 await panel.getByRole('button',{name:'Play Vid2Tab demo',exact:true}).click();await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(time);
});
test('mobile explains projects before media and exposes a coherent outline',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 for(const id of ['#vid2tab','#teachla']){const row=page.locator(id);const heading=await row.locator('h2').boundingBox();const media=await row.locator('.project-preview').boundingBox();expect(heading.y+heading.height).toBeLessThan(media.y);await expect(row.locator('.status')).toHaveCSS('font-size','12px');}
 await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
 await page.screenshot({path:'work/browser-artifacts/refinement-mobile.png',fullPage:true});
 await page.locator('#vid2tab').getByRole('button',{name:/Project details/}).click();
 expect(await page.locator('h1,h2,h3').evaluateAll(els=>{let prev=0;return els.filter(e=>e.getClientRects().length||e.classList.contains('visually-hidden')).every(e=>{const level=Number(e.tagName[1]);const valid=level<=prev+1;prev=level;return valid})})).toBe(true);
});
test('navigation reflects wordmark, direct hash and browser history',async({page})=>{
 await page.goto('/');const projects=page.getByRole('navigation').getByRole('link',{name:'Projects',exact:true});const about=page.getByRole('navigation').getByRole('link',{name:'About',exact:true});
 await about.click();await expect(about).toHaveAttribute('aria-current','location');await page.getByRole('link',{name:'Kevin Co',exact:true}).click();await expect(projects).toHaveAttribute('aria-current','location');await expect(about).not.toHaveClass('active');
 await page.goBack();await expect(about).toHaveAttribute('aria-current','location');await expect(page.locator('#about')).toBeVisible();
 await page.goto('/#about');await expect(about).toHaveAttribute('aria-current','location');
});
test('failed playback announces a visible recovery message without changing button role',async({page})=>{
 await page.route('**/assets/projects/vid2tab/demo.mp4',route=>route.abort());await page.goto('/');const panel=page.locator('[data-project-media]');
 await panel.getByRole('button',{name:'Play Vid2Tab demo',exact:true}).click();await expect(panel.getByRole('status')).toBeVisible();await expect(panel.getByRole('status')).toContainText('Video playback is unavailable');
 await expect(panel.getByRole('button',{name:'Pause Vid2Tab demo',exact:true})).not.toHaveAttribute('aria-pressed',/./);
});
for(const finalState of ['playing','paused'])test(`a delayed video request respects the final ${finalState} choice`,async({page})=>{
 let release;const gate=new Promise(resolve=>release=resolve);
 await page.route('**/assets/projects/vid2tab/demo.mp4',async route=>{await gate;await route.continue()});
 try{
  await page.goto('/');const panel=page.locator('[data-project-media]');const control=panel.locator('.project-media-toggle');const video=panel.locator('video');
  await control.click();await control.click();if(finalState==='playing')await control.click();
  release();await expect.poll(()=>video.evaluate(v=>v.readyState)).toBeGreaterThan(1);
  await expect(video).toHaveJSProperty('paused',finalState==='paused');
  await expect(control).toHaveAccessibleName(`${finalState==='playing'?'Pause':'Play'} Vid2Tab demo`);
 }finally{release()}
});
