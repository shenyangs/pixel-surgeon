export const nodeRequirement='Node.js 22.12+（22.x）、24.x 或 26+；与锁文件中的 Vitest 要求一致';
export function supportedNode(version){const [major,minor]=version.split('.').map(Number);return major===22&&minor>=12||major===24||major>=26;}
