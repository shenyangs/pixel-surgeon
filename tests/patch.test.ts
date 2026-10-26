import {describe,it,expect} from 'vitest';
import {patchSchema,renderPatch,preset} from '../server/patch';
describe('CSS trust boundary',()=>{
 it('renders validated preset',()=>expect(renderPatch(preset)).toContain('.hero-cta { border-radius: 24px; }'));
 for(const input of [
 {selector:'../../',property:'color',value:'#ffffff'},
 {selector:'.hero-cta',property:'background-color',value:'url(javascript:alert(1))'},
 {selector:'.hero-cta',property:'color',value:'</style><script>alert(1)</script>'},
 {selector:'.hero-cta',property:'position',value:'fixed'},
 {selector:'.hero-cta',property:'padding',value:'9999px'},
 {selector:'.hero-cta',property:'color',value:'#ffffff',path:'../../secret'},
 {selector:'body, .hero-cta',property:'color',value:'#ffffff'}
 ])it('rejects '+JSON.stringify(input),()=>expect(patchSchema.safeParse(input).success).toBe(false));
 it('allows safe shadow',()=>expect(patchSchema.safeParse({selector:'.hero-cta',property:'box-shadow',value:'0px 8px 24px #112233'}).success).toBe(true));
});
