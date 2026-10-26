import express from 'express';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { z } from 'zod';
import { preset, renderPatch } from './patch';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.browsers');
function userError(e:unknown){
 if(e instanceof z.ZodError)return '请求格式不正确：仅支持指定按钮及安全 CSS 值，请重新生成预设。';
 const message=(e as Error).message||'';
 if(message.includes('ENOENT'))return '所需文件不存在，可能尚无可撤销记录；请检查安装或先应用一次补丁。';
 if(message.includes('browserType')||message.includes('Executable'))return '无法启动截图浏览器，请运行 npm run browser:install，再重试。';
 if(message.includes('Timeout')||message.includes('page.goto'))return '截图超时或页面无法访问，请确认 http://127.0.0.1:4203 可访问后重试。';
 return /[\u4e00-\u9fff]/.test(message)?message:'操作失败，请检查本地服务和文件权限后重试。';
}
const app = express();
app.use(express.json({limit:'8kb'}));
app.use((req,res,next) => {
 const origin=req.headers.origin;
 if (req.method==='POST' && (origin && origin!=='http://127.0.0.1:4203' || !req.is('application/json'))) { res.status(403).json({error:'仅接受本地页面发起的 JSON 请求。'}); return; }
 next();
});
const cssPath=resolve('fixtures/demo-site/src/theme-overrides.css');
const backupPath=resolve('artifacts/original.css');
const evidencePath=resolve('artifacts/captures.json');
async function evidence(){try{return JSON.parse(await readFile(evidencePath,'utf8'));}catch{return {};}}
await mkdir('artifacts/captures',{recursive:true});
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const proposals=new Map<string,{before:string,after:string,expires:number}>();
let busy=false;
async function capture(label:string) {
 const browser=await chromium.launch({headless:true,channel:'chromium',timeout:15000});
 try { const page=await browser.newPage({viewport:{width:620,height:480}}); await page.goto('http://127.0.0.1:4203/fixtures/demo-site/index.html',{waitUntil:'networkidle',timeout:15000}); const name=`${label}-${randomUUID()}.png`; await page.screenshot({path:resolve('artifacts/captures',name),timeout:10000}); return `/api/captures/${name}`; } finally { await browser.close(); }
}
app.get('/api/health',(_req,res)=>res.json({ok:true,project:'pixel-surgeon',mode:'预设补丁 / 无 AI 推理'}));
app.use('/api/captures',express.static(resolve('artifacts/captures')));
app.get('/api/theme',async (_req,res)=>{res.type('css').set('Cache-Control','no-store').send(await readFile(cssPath,'utf8'));});
app.get('/api/state',async (_req,res)=>{let undo=false;try{await readFile(backupPath);undo=true;}catch{} res.json({css:await readFile(cssPath,'utf8'),undo,images:await evidence()});});
app.post('/api/propose',async(req,res)=>{
 try {
 z.object({selector:z.literal('.hero-cta'),instruction:z.string().min(1).max(300)}).strict().parse(req.body);
 if(!/(purple|紫色)/i.test(req.body.instruction)||!/(round|圆角)/i.test(req.body.instruction)) throw new Error('当前仅支持「紫色圆角」固定预设，没有连接语言模型。请输入「把按钮改为紫色圆角」。');
 if(proposals.size>30) proposals.clear();
 const before=await readFile(cssPath,'utf8'); const after=renderPatch(preset); const id=randomUUID();
 proposals.set(id,{before,after,expires:Date.now()+300000});
 res.json({id,before,after,patches:preset,mode:'预设补丁 / 无 AI 推理',diff:`--- theme-overrides.css\n+++ theme-overrides.css\n${before.split('\n').filter(Boolean).map(x=>'- '+x).join('\n')}\n${after.split('\n').filter(Boolean).map(x=>'+ '+x).join('\n')}`});
 }catch(e){res.status(400).json({error:userError(e)});}
});
app.post('/api/apply',async(req,res)=>{
 if(busy){res.status(409).json({error:'已有操作正在进行，请稍后重试。'});return;} busy=true;
 try {
 const {id}=z.object({id:z.string().uuid()}).strict().parse(req.body);const p=proposals.get(id);
 if(!p||p.expires<Date.now())throw new Error('方案不存在或已过期，请重新生成预设。');
 if(digest(await readFile(cssPath,'utf8'))!==digest(p.before))throw new Error('CSS 已发生变化，请重新生成方案并检查差异。');
 const beforeImage=await capture('before');
 await writeFile(backupPath,p.before); await writeFile(cssPath,p.after); proposals.clear();
 const afterImage=await capture('after');await writeFile(evidencePath,JSON.stringify({beforeImage,afterImage}));res.json({beforeImage,afterImage,css:p.after});
 }catch(e){res.status(400).json({error:userError(e)});}finally{busy=false;}
});
app.post('/api/undo',async(req,res)=>{
 if(busy){res.status(409).json({error:'已有操作正在进行，请稍后重试。'});return;}busy=true;
 try {z.object({}).strict().parse(req.body); const original=await readFile(backupPath,'utf8');await writeFile(cssPath,original);proposals.clear();const undoImage=await capture('undo');await writeFile(evidencePath,JSON.stringify({...await evidence(),undoImage}));res.json({undoImage});}
 catch(e){res.status(400).json({error:userError(e)});}finally{busy=false;}
});
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{res.status(400).json({error:userError(error)});});
app.listen(5203,'127.0.0.1',()=>console.log('[PixelSurgeon] 已启动：预设补丁 / 无 AI 推理，无需 API Key。\n浏览器访问：http://127.0.0.1:4203\n本地接口：http://127.0.0.1:5203/api/health')).on('error',()=>{console.error('接口启动失败：请检查 5203 端口是否被占用，运行 npm run doctor 获取诊断。');process.exit(1)});
