import express from 'express';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { z } from 'zod';
import { preset, renderPatch } from './patch';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.browsers');
const app = express();
app.use(express.json({limit:'8kb'}));
app.use((req,res,next) => {
 const origin=req.headers.origin;
 if (req.method==='POST' && (origin && origin!=='http://127.0.0.1:4203' || !req.is('application/json'))) { res.status(403).json({error:'Only local JSON requests are accepted'}); return; }
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
 const browser=await chromium.launch({headless:true,channel:'chromium'});
 try { const page=await browser.newPage({viewport:{width:620,height:480}}); await page.goto('http://127.0.0.1:4203/fixtures/demo-site/index.html',{waitUntil:'networkidle',timeout:15000}); const name=`${label}-${randomUUID()}.png`; await page.screenshot({path:resolve('artifacts/captures',name)}); return `/api/captures/${name}`; } finally { await browser.close(); }
}
app.get('/api/health',(_req,res)=>res.json({ok:true,project:'pixel-surgeon',mode:'Preset patch / NO AI'}));
app.use('/api/captures',express.static(resolve('artifacts/captures')));
app.get('/api/theme',async (_req,res)=>{res.type('css').set('Cache-Control','no-store').send(await readFile(cssPath,'utf8'));});
app.get('/api/state',async (_req,res)=>{let undo=false;try{await readFile(backupPath);undo=true;}catch{} res.json({css:await readFile(cssPath,'utf8'),undo,images:await evidence()});});
app.post('/api/propose',async(req,res)=>{
 try {
 z.object({selector:z.literal('.hero-cta'),instruction:z.string().min(1).max(300)}).strict().parse(req.body);
 if(!/purple/i.test(req.body.instruction)||!/round/i.test(req.body.instruction)) throw new Error('This named preset supports “rounded and purple” only. No language model is connected.');
 if(proposals.size>30) proposals.clear();
 const before=await readFile(cssPath,'utf8'); const after=renderPatch(preset); const id=randomUUID();
 proposals.set(id,{before,after,expires:Date.now()+300000});
 res.json({id,before,after,patches:preset,mode:'Preset patch / NO AI',diff:`--- theme-overrides.css\n+++ theme-overrides.css\n${before.split('\n').filter(Boolean).map(x=>'- '+x).join('\n')}\n${after.split('\n').filter(Boolean).map(x=>'+ '+x).join('\n')}`});
 }catch(e){res.status(400).json({error:(e as Error).message});}
});
app.post('/api/apply',async(req,res)=>{
 if(busy){res.status(409).json({error:'An operation is running'});return;} busy=true;
 try {
 const {id}=z.object({id:z.string().uuid()}).strict().parse(req.body);const p=proposals.get(id);
 if(!p||p.expires<Date.now())throw new Error('Proposal expired; generate again');
 if(digest(await readFile(cssPath,'utf8'))!==digest(p.before))throw new Error('CSS changed; generate a fresh proposal');
 const beforeImage=await capture('before');
 await writeFile(backupPath,p.before); await writeFile(cssPath,p.after); proposals.clear();
 const afterImage=await capture('after');await writeFile(evidencePath,JSON.stringify({beforeImage,afterImage}));res.json({beforeImage,afterImage,css:p.after});
 }catch(e){res.status(400).json({error:(e as Error).message});}finally{busy=false;}
});
app.post('/api/undo',async(req,res)=>{
 if(busy){res.status(409).json({error:'An operation is running'});return;}busy=true;
 try {z.object({}).strict().parse(req.body); const original=await readFile(backupPath,'utf8');await writeFile(cssPath,original);proposals.clear();const undoImage=await capture('undo');await writeFile(evidencePath,JSON.stringify({...await evidence(),undoImage}));res.json({undoImage});}
 catch(e){res.status(400).json({error:(e as Error).message});}finally{busy=false;}
});
app.listen(5203,'127.0.0.1',()=>console.log('[pixel-surgeon] http://127.0.0.1:5203 · Preset / NO AI'));
