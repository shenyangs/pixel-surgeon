import {it,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
it('依赖缺失时输出中文修复建议并返回非零退出码',()=>{
 const result=spawnSync(process.execPath,['scripts/doctor.mjs'],{env:{...process.env,PIXEL_DOCTOR_DEPENDENCY_ROOT:resolve('artifacts/doctor-empty')},encoding:'utf8',timeout:10000});
 expect(result.status).toBe(1);
 expect(result.stdout).toContain('缺少项目依赖');
 expect(result.stdout).toContain('npm run setup');
 expect(result.stdout).toContain('无需 API Key');
 expect(result.stderr).not.toContain('MODULE_NOT_FOUND');
});
it('Node 版本判定与实际依赖引擎一致',async()=>{
 const {supportedNode}=await import('../scripts/runtime.mjs');
 for(const version of ['20.19.0','22.0.0','22.11.0','23.0.0','25.1.0'])expect(supportedNode(version)).toBe(false);
 for(const version of ['22.12.0','22.20.0','24.0.0','26.4.0'])expect(supportedNode(version)).toBe(true);
});
