# PixelSurgeon · 本地样式修补台

选择按钮、检查 CSS 差异、写入真实文件，再用截图与撤销验证变化。一次精确修改，让按钮更好看。

**当前状态：PARTIAL（部分完成）。中文预设工作流可运行，真实 AI 模型转换尚未实现。** 默认使用「预设补丁 / 无 AI 推理」，无需注册、API Key 或外部服务。Orbit 是随附的 React 示例站点；文件修改、截图和视频均为真实操作结果，不是模拟模型输出。

## 环境与快速启动

需要 **Node.js 22.12+（22.x）、24.x 或 26+，随 Node 附带的 npm，以及可安装 Chromium 的桌面环境**。已在 macOS / Node.js 26.4.0 验证；Node.js 要求与锁文件中的 Vitest 一致，23.x / 25.x 不属于支持范围。Windows / Linux 使用相同 npm 命令，但本次未在这两个系统执行。Linux 若缺浏览器系统库，需要自行按 Playwright 官方说明处理；本项目脚本不会更改机器设置、执行系统包安装或请求管理员权限。

在本仓库根目录打开终端，执行：

```sh
npm run setup
npm run doctor
npm run dev
```

`setup` 先执行 `npm ci --cache .npm-cache`，严格使用锁文件安装本项目依赖，再安装所需 Chromium（不安装额外 headless shell）。浏览器放在项目 `.browsers/`，匹配版本已存在时直接复用。`doctor` 不依赖已安装的项目包就能启动，检查 Node 版本、依赖、浏览器文件和端口；缺项时以中文给出处理建议，返回退出码 1。

也可逐步安装，便于定位失败：

```sh
npm ci --cache .npm-cache
npm run browser:install
npm run doctor
npm run dev
```

启动后访问 **http://127.0.0.1:4203**。接口健康检查为 **http://127.0.0.1:5203/api/health**。请使用这个精确入口；界面与接口仅绑定 `127.0.0.1`，不开放局域网访问。终端会打印中文访问地址。运行时保持终端开启，按 Ctrl+C 停止。运行自动化测试前先停止手动启动的服务，让测试自己启动两个端口。

macOS/Linux 终端、Windows PowerShell 和 cmd 均使用上面的 npm 命令，不需要 `VAR=value command` 形式。脚本内部通过 Node 传递环境变量。通常无需设置环境变量；已有兼容浏览器时可选用 `PLAYWRIGHT_BROWSERS_PATH`，例如 PowerShell 用 `$env:PLAYWRIGHT_BROWSERS_PATH="路径"`，cmd 用 `set PLAYWRIGHT_BROWSERS_PATH=路径`，macOS/Linux 用 `export PLAYWRIGHT_BROWSERS_PATH="路径"`。目录必须与当前 Playwright 版本匹配。

## 三步演示

1. 点击左侧示例站点中的 **开始创作**，选中 `.hero-cta`。也可通过 Tab 聚焦并按 Enter 选择。
2. 保留默认输入 **把按钮改为紫色圆角**，点击 **生成预设**。检查差异；此时文件和按钮外观尚未修改。
3. 点击 **应用补丁**。后端先截图，再写入固定 CSS 文件，并拍摄修改后的截图。按钮变成紫色圆角。

刷新页面后效果仍保留，点击 **撤销** 恢复上一份 CSS，并生成恢复截图。「变化有图为证」区域可查看真实前后截图，刷新后仍保留。界面提供三步引导、键盘焦点、处理中状态、中文错误及小屏布局。

## 依赖说明

具体版本由 `package-lock.json` 固定，请使用 `npm ci`，不要用更新依赖替代修复环境问题。

| 依赖 | 作用 |
| --- | --- |
| react、react-dom | 编辑界面和随附示例站点 |
| express | 本地接口、读取固定 CSS、应用与撤销 |
| zod | 严格验证结构、选择器及属性值 |
| vite、@vitejs/plugin-react | 本地开发服务和两个页面的构建 |
| typescript、@types/* | 源码类型检查及对应类型定义 |
| tsx | 运行 TypeScript 后端与开发监听 |
| concurrently | 同时启动界面和接口，退出时清理子进程 |
| @playwright/test、Chromium | 后端真实截图、端到端断言和录屏 |
| vitest | 安全验证与 doctor 缺依赖路径测试 |

已移除未使用的 lucide-react 和 diff。无需数据库、Docker、额外账号或模型服务。`setup`、`doctor` 仅使用 Node 自带模块；没有跨项目文件依赖。`.env.example` 说明当前模式，填写 Key 不会开启 AI。

## 验证和证据

```sh
npm run build
npm run test
npm run e2e
npm run demo
```

构建同时检查 TypeScript 并打包编辑器、示例站点。开发访问使用 `npm run dev`，本版本未提供托管生产部署。

测试保留实际断言：应用前样式不变、真实磁盘内容更新、计算样式改变、前后截图字节不同、刷新持久化、撤销后样式及文件恢复。安全测试拒绝目录穿越、脚本 URL、注入、额外路径字段、非允许选择器及属性。中文验收增加键盘选择、小屏无横向溢出、中文错误恢复、doctor 缺依赖诊断。

本地证据不会提交到 Git，可重新执行上述命令生成：

- `artifacts/logs/zh-*.log`：本轮安装、诊断、四项验证的真实日志。
- `artifacts/playwright/demo/`：中文演示视频与测试截图；`artifacts/playwright/e2e/` 为端到端记录。
- `artifacts/demo-before.png`、`artifacts/demo-after.png`、`artifacts/demo-undo.png`：中文完整界面截图。
- `artifacts/zh-mobile.png`：390 像素宽的小屏截图。
- `artifacts/captures/`：后端真实浏览器截图；`artifacts/captures.json` 保存当前引用。
- `status.json`：实际结果与未验证项。历史首轮缺浏览器失败日志也保留，不伪装成一次全通过。

本轮实际结果：build 通过、11 项单元测试通过、3 项 E2E 通过、1 项约 29 秒中文演示通过。中文演示首次在截图阶段超时，根因未确认；保留 `artifacts/logs/zh-demo-first-failed.log` 及 `artifacts/playwright/zh-demo-first-failed/`，增加浏览器启动/截图超时限制后单独重跑通过。doctor 正常路径返回 0，模拟缺依赖与缺浏览器均正确返回 1 并给出中文建议。

本轮重新执行项目依赖安装并复用已有匹配浏览器；**未验证空缓存、全新机器上的首次完整下载，也未验证 Windows/Linux 实机**。

## 常见问题与恢复

- **缺依赖或安装中断**：重新执行 `npm run setup`。只修复依赖可执行 `npm ci --cache .npm-cache`；锁文件会保持一致。下载需要可用网络。
- **浏览器缺失 / 无法截图**：执行 `npm run browser:install`，再运行 `npm run doctor`。确认界面地址能正常打开。不要删除仍在运行中的浏览器缓存。
- **端口冲突**：先按 Ctrl+C 停止本项目旧服务，再检查占用 4203 / 5203 的其他程序。doctor 会提示不可用端口；本项目已运行时出现占用提示属于预期。脚本不会自动杀死其他进程或擅自换端口。
- **方案过期 / CSS 已变更**：重新生成预设，检查差异后再应用。方案有效期为五分钟。
- **不支持请求**：当前只接受「紫色圆角」固定预设，也兼容 `rounded and purple`。不是任意自然语言编辑器。
- **应用后截图失败**：CSS 可能已写入。界面会尝试刷新状态并启用撤销；也可刷新后点击撤销。先修复浏览器或服务，再重试截图。
- **没有撤销记录**：先应用一次补丁。只保留上一份快照，不是多级历史记录。

## 能力边界

仅允许修改随附示例的 `.hero-cta`。允许属性为 color、background-color、border-radius、padding、font-size、box-shadow，属性值必须符合受限格式。后端不接受任意文件路径、网页地址、脚本或命令。唯一可修改的源文件为 `fixtures/demo-site/src/theme-overrides.css`；快照写入 `artifacts/original.css`，截图和元数据也仅保存于本项目 artifacts 目录。

仅供单用户本地使用，无账户、认证或公网服务。变更请求必须使用 JSON，来自其他网页源的请求会被拒绝；应用/撤销不能并发执行。截图导航设有超时。截图会累积，可在服务停止后清理不再需要的 artifacts；清理会同时丢失撤销记录和历史截图。未实现真实模型推理、任意网站修补、视觉评分或自动修复。采用 MIT 许可，见 LICENSE 法律原文。
