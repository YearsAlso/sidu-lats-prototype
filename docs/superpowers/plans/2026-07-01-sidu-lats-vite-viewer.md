# SIDU-LATS Vite 多页外壳 — 实施计划

**日期**: 2026-07-01
**对应 spec**: `docs/superpowers/specs/2026-07-01-sidu-lats-vite-viewer.md`
**目标**: 仓库根新增 Vite 外壳,20 个现有 HTML 零改动,生产改为部署 `dist/`。

## 范围

- 新增 8 个文件:`package.json` / `viewer.html` / `vite.config.js` / `src/viewer/main.js` / `src/viewer/viewer.css` / `src/viewer/prototype-pages.js` / `.gitignore`(新增) / `README.md`(改)
- **不改动**任何现有 HTML(20 个)、不改 `index.html`、不改 sessionStorage 鉴权流、不改侧栏硬编码路径。
- 参考实现:`/Users/mengxiang/Projects/Company/TDM/daqprototypev4`

## 任务清单

### 阶段 0:骨架与依赖

- [ ] T1 创建 `package.json`(`type: module`,scripts `dev/build/preview`,devDep `vite ^5.4.19`,无 dependencies)
- [ ] T2 创建 `.gitignore`(追加 `node_modules/`、`dist/`;保留现有 gitignore 内容若无则新建)
- [ ] T3 `npm install`(验证 vite 5 可装,Node 18+)

### 阶段 1:viewer 外壳(移植自 daqprototypev4)

- [ ] T4 创建 `src/viewer/prototype-pages.js` — SIDU 20 页注册表,三组:入口(2)/主应用(10)/角色入口(8)。**校正 spec 笔误**:角色登录页 path 用 `roles/<role>/<role>-login.html`(非 dashboard)。派生导出 `prototypePages` / `prototypePageMap`。`DEFAULT_PAGE = 'index.html'`
- [ ] T5 创建 `src/viewer/viewer.css` — 外壳样式(抽屉、iframe 包裹、工具栏、状态面板、搜索框、导航分组),从 daqprototypev4 移植并适配 SIDU antd 5 视觉(白底/`#f5f5f5`/`#1677ff`)
- [ ] T6 创建 `src/viewer/main.js` — URL `?page=` 驱动、`history.pushState`、后退/前进/刷新/独立打开(`window.open`)/复制链接(`navigator.clipboard`)、搜索过滤、抽屉折叠。外壳与 iframe **不通信**(无 postMessage)
- [ ] T7 创建 `viewer.html` — 外壳 DOM:左导航抽屉 + 右 iframe + 工具栏,`<script type="module" src="/src/viewer/main.js">`

### 阶段 2:Vite 多页构建配置

- [ ] T8 创建 `vite.config.js` — `rollupOptions.input` 登记 21 个入口(20 页 + `viewer.html`),input key 用路径短 id;`server.open = '/viewer.html'`;`build.outDir = 'dist'`
- [ ] T9 `npm run dev` 启动,访问 `http://localhost:5173/viewer.html`,验证侧栏三组共 20 项 + 搜索

### 阶段 3:功能与鉴权验证

- [ ] T10 点击导航项 → iframe 加载对应页 → URL 更新为 `?page=<path>`
- [ ] T11 iframe 内走"登录 → 仪表盘 → 点侧栏其他菜单"全链路,sessionStorage 鉴权不丢失,跳转可达
- [ ] T12 后退/前进/刷新/独立打开/复制链接五按钮功能正确
- [ ] T13 `?page=` 为空/非法 → 回退 `DEFAULT_PAGE`

### 阶段 4:构建与部署

- [ ] T14 `npm run build` → `dist/` 含 21 份独立 HTML
- [ ] T15 `dist/` 下任一 HTML 双击可独立运行(无 404、样式不丢)—— 验证"双击可跑"未破坏
- [ ] T16 `git diff --stat` 确认现有 20 个源 HTML 与 HEAD 相比零改动(仅新增文件)
- [ ] T17 更新 `README.md`:新增「本地开发外壳」(`npm run dev` → viewer.html)与「部署 dist/」说明
- [ ] T18 部署源切换说明(GH Pages 指向 `dist/` 或 Action build,留给 owner 在 README 注明)

### 阶段 5:复核

- [ ] T19 调用 `prototype-code-reviewer` 复核约束 + `prototype-syntax-reviewer` 审核语法逻辑
- [ ] T20 浏览器手测全链路通过后 commit

## 风险与回滚

- **风险 1**:Vite build 对内联 `<script type="module">` 的 HTML 可能注入 hash/transform。**缓解**:build 后 diff 源与 dist 的 HTML,确认内联内容字节级一致(允许 Vite 注入 modulepreload 等,但 style/script 内容不变)。若被改写,改用 `build.assetsInclude` 或把 HTML 作为静态资源拷贝。
- **风险 2**:iframe 内相对路径 `location.href` 在 dev server 根下解析正常,但 `vite preview` 下可能 base 路径不同。**缓解**:`vite.config.js` 显式设 `base: './'`(相对路径,适配 GH Pages 子路径)。
- **回滚**:全部为新增文件,回滚即 `git clean` 新增项 + 恢复 README;现有 20 页未动,零回滚成本。

## Out of Scope(spec §10)

- 不统一「哈希链」命名
- 不抽公共 CSS/JS、不引 antd JS 库
- 不改鉴权流、不改侧栏硬编码路径
- 不做 viewer↔iframe postMessage 通信
- 不做组件化(daqprototypev4 的 `src/components/` Web Components 不引入)
