import {supportedNode,nodeRequirement} from './runtime.mjs';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import net from 'node:net';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dependencyRoot=process.env.PIXEL_DOCTOR_DEPENDENCY_ROOT||root;
let failures=0;
function report(ok,message){console.log(`${ok?'[通过]':'[需处理]'} ${message}`);if(!ok)failures++}
report(supportedNode(process.versions.node),`当前 Node.js ${process.versions.node}；要求 ${nodeRequirement}。`);
const pkg=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
const missing=Object.keys({...pkg.dependencies,...pkg.devDependencies}).filter(name=>!existsSync(resolve(dependencyRoot,'node_modules',name,'package.json')));
report(!missing.length,missing.length?`缺少项目依赖：${missing.join('、')}。请运行 npm run setup 或 npm ci --cache .npm-cache。`:'项目依赖齐全。');
if(!missing.includes('@playwright/test')){
 try{
 process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve(root,'.browsers');
 const require=createRequire(resolve(dependencyRoot,'package.json'));
 const {chromium}=require('@playwright/test');
 report(existsSync(chromium.executablePath()),'Chromium 浏览器'+(existsSync(chromium.executablePath())?'已安装。':'缺失；请运行 npm run browser:install。'));
 }catch{report(false,'无法加载 Playwright；请运行 npm run setup 修复依赖。')}
}else report(false,'未检查浏览器：需先安装 Playwright 依赖。');
for(const port of [4203,5203])await new Promise(done=>{
 const server=net.createServer();
 server.once('error',()=>{report(false,`端口 ${port} 不可用；若本项目已启动，这是正常提示；否则请先关闭占用该端口的程序再重试。`);done()});
 server.listen(port,'127.0.0.1',()=>{report(true,`本地端口 ${port} 可用。`);server.close(done)});
});
console.log('默认使用「预设补丁 / 无 AI」，无需 API Key。访问入口：http://127.0.0.1:4203');
console.log(failures?'请按上述中文提示处理后重新运行 npm run doctor。':'环境检查完成，可以运行 npm run dev。');
process.exitCode=failures?1:0;
