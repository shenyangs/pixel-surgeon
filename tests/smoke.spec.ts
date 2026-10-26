import {test,expect} from '@playwright/test';
test('API rejects arbitrary files, selectors, stale and foreign requests',async({request})=>{
 expect((await request.get('/api/health')).ok()).toBe(true);
 expect((await request.post('/api/propose',{data:{selector:'../../',instruction:'rounded purple'}})).status()).toBe(400);
 expect((await request.post('/api/propose',{data:{selector:'.hero-cta',instruction:'rounded purple',path:'/tmp/evil'}})).status()).toBe(400);
 expect((await request.post('/api/propose',{data:{selector:'.hero-cta',instruction:'make it blue'}})).status()).toBe(400);
 expect((await request.post('/api/apply',{data:{id:'00000000-0000-4000-8000-000000000000'}})).status()).toBe(400);
 expect((await request.post('/api/undo',{data:{},headers:{Origin:'https://evil.example'}})).status()).toBe(403);
});
test('中文错误、键盘选择与小屏布局',async({page,request})=>{
 const invalid=await request.post('/api/propose',{data:{selector:'.hero-cta',instruction:'改成蓝色'}});
 expect((await invalid.json()).error).toContain('当前仅支持「紫色圆角」');
 const malformed=await request.post('/api/apply',{data:{id:'invalid'}});
 expect((await malformed.json()).error).toContain('请求格式不正确');
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
 await expect(page.getByLabel('首次使用三步引导')).toBeVisible();
 const cta=page.frameLocator('iframe').getByRole('button',{name:'开始创作'});
 await cta.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'生成预设'})).toBeEnabled();
 await page.getByLabel('希望如何修改？').fill('改成蓝色');
 await page.getByRole('button',{name:'生成预设'}).click();
 await expect(page.getByRole('alert')).toContainText('当前仅支持「紫色圆角」');
 await page.getByLabel('希望如何修改？').fill('把按钮改为紫色圆角');
 await page.getByRole('button',{name:'生成预设'}).click();
 await expect(page.locator('pre')).toContainText('border-radius: 24px');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'artifacts/zh-mobile.png',fullPage:true});
});
