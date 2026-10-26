import { z } from 'zod';
export const patchSchema = z.object({
 selector: z.literal('.hero-cta'),
 property: z.enum(['color','background-color','border-radius','padding','font-size','box-shadow']),
 value: z.string().max(90)
}).strict().superRefine((p, ctx) => {
 const px = '(?:0|[1-9][0-9]?)px';
 const patterns: Record<string, RegExp> = {
  color: /^#[0-9a-fA-F]{6}$/, 'background-color': /^#[0-9a-fA-F]{6}$/,
  'border-radius': new RegExp(`^${px}$`), padding: new RegExp(`^${px}(?: ${px})?$`),
  'font-size': /^(?:1[2-9]|[2-6][0-9]|7[0-2])px$/,
  'box-shadow': new RegExp(`^0px ${px} ${px} #[0-9a-fA-F]{6}$`)
 };
 if (!patterns[p.property].test(p.value)) ctx.addIssue({code:'custom',message:'Value is outside the safe CSS grammar'});
});
export const patchesSchema = z.array(patchSchema).min(1).max(6);
export function renderPatch(input: unknown) { return patchesSchema.parse(input).map(p => `${p.selector} { ${p.property}: ${p.value}; }`).join('\n')+'\n'; }
export const preset = [
 {selector:'.hero-cta',property:'background-color',value:'#8b5cf6'},
 {selector:'.hero-cta',property:'border-radius',value:'24px'},
 {selector:'.hero-cta',property:'padding',value:'16px 28px'},
 {selector:'.hero-cta',property:'color',value:'#ffffff'}
];
