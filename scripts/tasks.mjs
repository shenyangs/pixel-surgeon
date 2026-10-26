import {supportedNode,nodeRequirement} from './runtime.mjs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const env={...process.env,PLAYWRIGHT_BROWSERS_PATH:process.env.PLAYWRIGHT_BROWSERS_PATH||resolve(root,'.browsers')};
function run(file,args){const result=spawnSync(process.execPath,[file,...args],{cwd:root,env,stdio:'inherit'});if(result.error){console.error('执行失败：'+result.error.message);process.exit(1)}if(result.status!==0)process.exit(result.status||1)}
const mode=process.argv[2];
if(mode==='setup'){
 if(!supportedNode(process.versions.node)){console.error('版本不兼容：需要 '+nodeRequirement+'。请升级后重试。');process.exit(1)}
 console.log('准备项目：按锁文件安装依赖，并检查项目内 Chromium（已有匹配版本不会重复下载）。');
 if(!process.env.npm_execpath){console.error('请使用 npm run setup 执行。');process.exit(1)}
 run(process.env.npm_execpath,['ci','--cache','.npm-cache']);
}
if(mode==='setup'||mode==='browser'){
 run(resolve(root,'node_modules/@playwright/test/cli.js'),['install','chromium','--no-shell']);
 console.log('浏览器准备完成。运行 npm run doctor 检查，再运行 npm run dev 启动。');
}else if(mode==='demo'){
 env.DEMO_RUN='1';run(resolve(root,'node_modules/@playwright/test/cli.js'),['test','tests/demo.spec.ts']);
}else{console.error('未知任务，请使用 setup、browser 或 demo。');process.exit(1)}
