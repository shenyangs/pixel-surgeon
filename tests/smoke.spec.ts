import {test,expect} from '@playwright/test';
test('API rejects arbitrary files, selectors, stale and foreign requests',async({request})=>{
 expect((await request.get('/api/health')).ok()).toBe(true);
 expect((await request.post('/api/propose',{data:{selector:'../../',instruction:'rounded purple'}})).status()).toBe(400);
 expect((await request.post('/api/propose',{data:{selector:'.hero-cta',instruction:'rounded purple',path:'/tmp/evil'}})).status()).toBe(400);
 expect((await request.post('/api/propose',{data:{selector:'.hero-cta',instruction:'make it blue'}})).status()).toBe(400);
 expect((await request.post('/api/apply',{data:{id:'00000000-0000-4000-8000-000000000000'}})).status()).toBe(400);
 expect((await request.post('/api/undo',{data:{},headers:{Origin:'https://evil.example'}})).status()).toBe(403);
});
