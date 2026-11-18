const {test,expect}=require('@playwright/test');
test('the writeup is one readable story with the walkthrough beside its video',async({page})=>{
 await page.goto('/');const project=page.locator('#vid2tab');await project.getByRole('button',{name:/Project details/}).click();
 const story=project.locator('.project-story');await expect(story).toBeVisible();
 for(const heading of ['Why I built it','Turning the idea into a working product','Beyond PDF extraction','Building with AI agents',"What's next"]){await expect(story.getByRole('heading',{name:heading,exact:true})).toBeVisible();}
 await expect(story.getByRole('heading',{name:'Demo',exact:true})).toHaveCount(0);await expect(story.getByRole('heading',{name:'Tech',exact:true})).toHaveCount(0);
 await expect(story).toContainText('Claude Code as my primary implementation tool');
 await expect(story.locator('.story-section').first().locator('p')).toHaveCount(3);
 await expect(project.locator('.walkthrough-caption')).toContainText('Watch the local app');
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  const column=await story.boundingBox();const paragraphs=await story.locator('.story-section > p').evaluateAll(ps=>ps.map(p=>({x:p.getBoundingClientRect().x,width:p.getBoundingClientRect().width})));
  expect(column.width).toBeLessThanOrEqual(780);for(const p of paragraphs){expect(Math.abs(p.x-column.x)).toBeLessThanOrEqual(1);expect(p.width).toBeLessThanOrEqual(column.width);}
  await page.screenshot({path:`work/browser-artifacts/story-${width}.png`,fullPage:true});
 }
});
