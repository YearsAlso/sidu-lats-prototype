# SIDU-LATS Vite 多页外壳(viewer)设计

**日期**: 2026-07-01
**范围**: `sidu-lats-prototype` 仓库根新增 Vite 外壳工程,不改动现有 20 个 HTML
**目标**: 引入 Vite 多页构建 + 导航外壳,提供"侧栏分组 + iframe 预览 + URL 驱动跳转"的开发/演示体验,生产改为部署 `dist/`。
**参考实现**: `/Users/mengxiang/Projects/Company/TDM/daqprototypev4`(TDM Prototype Viewer)

> 本规范不 supersede 任何旧规范,与视觉规范 `2026-07-01-sidu-lats-deai-design.md`(已废弃)及当前 antd 5 规范并行,互不影响。

## 1. 背景

当前 SIDU-LATS 是 20 个完全自包含的静态 HTML,通过 GitHub Pages 推 master 直接部署。存在的问题:

- 没有"总览所有页面/分组导航"的入口,只能逐个文件双击或点侧栏跳转。
- 演示/移交时,无法快速定位到某一角色入口或功能页。
- 无本地开发服务器,iframe 跨页跳转在 file:// 下偶有兼容问题。

`daqprototypev4` 项目已有一套成熟的 Vite viewer 外壳:左侧导航抽屉 + 右侧 iframe + URL `?page=` 驱动 + 后退/前进/刷新/独立打开/复制链接 + 分组搜索。该外壳**不改原型页本身**,只负责浏览导航,模式与 SIDU 的"自包含单页"约束天然兼容。

## 2. 设计目标

- **不破坏自包含**:20 个现有 HTML 一行不改,Vite 多页 build 只原样拷贝到 `dist/`,单页仍双击可跑。
- **新增外壳入口**:新增 `viewer.html` 作为导航外壳,现有 `index.html`(GH Pages 根登录页)保持不动。外壳仅在开发/演示时用 `vite dev` 打开。
- **生产部署切换**:生产改为 `vite build` 产出 `dist/` 后部署 `dist/`(调整 GitHub Pages 部署源)。
- **鉴权零改动**:sessionStorage 鉴权流(`lats_logged_in` / `lats_user`)不改;iframe 内 `location.href` 跳转时 sessionStorage 在同一 iframe 上下文持久,登录→仪表盘链路在 iframe 内照常工作。
- **侧栏路径不变**:20 页内部的硬编码跳转路径一律不动。
- **命名不统一**:本次不做「哈希链→数据完整性验证」改名,留作后续独立任务。

## 3. 交付物清单

仓库根新增以下文件(不删除/不改动任何现有文件,除 README):

| 文件 | 作用 |
|------|------|
| `package.json` | `type: module`、scripts `dev/build/preview`、devDep `vite ^5.4.19` |
| `viewer.html` | 外壳入口:左导航抽屉 + 右 iframe + 工具栏,`<script type="module" src="/src/viewer/main.js">` |
| `vite.config.js` | `rollupOptions.input` 登记 20 个 HTML + `viewer.html` 共 21 个入口 |
| `src/viewer/main.js` | 移植自 daqprototypev4:URL `?page=` 驱动、历史、刷新、独立打开、复制链接、搜索 |
| `src/viewer/viewer.css` | 外壳样式(抽屉、iframe 包裹、工具栏、状态面板) |
| `src/viewer/prototype-pages.js` | SIDU 20 页注册表(分组 + label + path) |
| `.gitignore` | 追加 `node_modules/`、`dist/` |
| `README.md` | 更新「常用命令」「部署」说明,新增「本地开发外壳」一节 |

## 4. 页面注册表(prototype-pages.js)

SIDU 20 页按现有目录结构分三组:

```js
export const DEFAULT_PAGE = 'index.html';

export const prototypeGroups = [
  { id: 'entry',  label: '入口',
    items: [
      { path: 'index.html',               label: '主登录(根)' },
      { path: 'pages/login.html',         label: '备用登录' },
    ]},
  { id: 'main',   label: '主应用',
    items: [
      { path: 'pages/dashboard.html',        label: '仪表盘' },
      { path: 'pages/audit-log.html',        label: '审计日志' },
      { path: 'pages/hash-chain.html',       label: '哈希链' },
      { path: 'pages/approval.html',         label: '审批中心' },
      { path: 'pages/user-management.html',  label: '用户管理' },
      { path: 'pages/storage.html',          label: '存储管理' },
      { path: 'pages/report-export.html',    label: '报告导出' },
      { path: 'pages/notifications.html',    label: '通知中心' },
      { path: 'pages/system-settings.html',  label: '系统设置' },
      { path: 'pages/token-management.html', label: 'Token 管理' },
    ]},
  { id: 'roles',  label: '角色入口',
    items: [
      { path: 'roles/admin/admin-dashboard.html',     label: 'Admin 登录' },
      { path: 'roles/admin/admin-dashboard.html',     label: 'Admin 仪表盘' },
      { path: 'roles/operator/operator-login.html',  label: 'Operator 登录' },
      { path: 'roles/operator/operator-dashboard.html', label: 'Operator 仪表盘' },
      { path: 'roles/auditor/auditor-login.html',    label: 'Auditor 登录' },
      { path: 'roles/auditor/auditor-dashboard.html', label: 'Auditor 仪表盘' },
      { path: 'roles/viewer/viewer-login.html',      label: 'Viewer 登录' },
      { path: 'roles/viewer/viewer-dashboard.html',  label: 'Viewer 仪表盘' },
    ]},
];
```

> 注:角色入口登录页用 `admin-login.html` 等(注册表里「Admin 登录」path 应为 `roles/admin/admin-login.html`,实施时校正)。

注册表沿用 daqprototypev4 的派生导出(`prototypePages` / `prototypePageMap`),`main.js` 不改逻辑。

## 5. vite.config.js 入口登记

`rollupOptions.input` 必须列出全部 21 个入口(20 页 + viewer.html),否则 build 产物会缺页。input key 用与路径一致的短 id(如 `pages-dashboard`、`roles-admin-login`、`viewer`)。

`server.open` 指向 `/viewer.html`(`vite dev` 启动后默认打开外壳,而非登录页)。

## 6. 外壳交互规格

- **导航抽屉**:左侧,可折叠;顶部品牌区、搜索框、当前页面信息、工具栏(后退/前进/刷新/独立打开/复制链接)、分组导航列表、底部状态。
- **iframe 预览**:右侧占满,`referrerpolicy="no-referrer"`。
- **URL 驱动**:读 `?page=<path>`,缺省回退 `DEFAULT_PAGE`;切换页时 `history.pushState` 更新 URL。
- **独立打开**:新窗口打开该页原始路径(`window.open`)。
- **复制链接**:复制带 `?page=` 的当前 URL。
- **搜索**:按 label/path 过滤导航项。
- **状态**:底部显示「Viewer ready.」/ 当前加载页 / 加载耗时等。

外壳与 iframe 内页面**不通信**(不注入 postMessage、不读 iframe DOM),保证侧栏硬编码跳转不受影响。

## 7. 部署变更

- **旧**:推 `master` 根目录 → GitHub Pages 直接服务 20 个 HTML。
- **新**:`vite build` 产出 `dist/`(21 份独立 HTML + viewer 资源)→ GitHub Pages 部署源指向 `dist/`(或用 GitHub Action 在推 master 时 build 并发布 `dist` 到 `gh-pages` 分支)。
- 单页自包含特性在 `dist/` 中保持不变,仍可双击打开(验证项)。

> 部署源的具体切换(分支 vs Action)由仓库 owner 在实施阶段确定,本 spec 只规定"产出 dist 并部署 dist"。

## 8. 输入约束 / 输出约束 / 边界条件

**输入约束**:
- Node 环境(vite 5 要求 Node 18+)。
- 现有 20 个 HTML 不接受任何修改。

**输出约束**:
- `dist/` 下每个 HTML 与源文件字节等价(允许 Vite 注入 dev/prod 标记的差异,但内联 style/script 内容不变)。
- `viewer.html` 及 `src/viewer/*` 为新增,不覆盖既有文件。

**边界条件**:
- `?page=` 为空或非法路径 → 回退 `DEFAULT_PAGE`。
- iframe 内登录跳转使用相对路径,与外壳同源下 sessionStorage 共享,不触发跨域隔离。
- `vite dev` 与 `vite preview` 下,iframe 内 `location.href` 相对路径解析正常。

## 9. 验收标准

1. `npm install && npm run dev` 后访问 `http://localhost:5173/viewer.html`,左侧出现三组共 20 个导航项,搜索可用。
2. 点击任意导航项,右侧 iframe 加载对应页面;URL 更新为 `?page=<path>`。
3. 在 iframe 内完成"登录 → 仪表盘 → 点击侧栏其他菜单"全链路,sessionStorage 鉴权不丢失,跳转可达。
4. 后退/前进/刷新/独立打开/复制链接五个按钮功能正确。
5. `npm run build` 产出 `dist/`,含 21 份独立 HTML;`dist/` 下任一 HTML 双击可独立运行(无 404、样式不丢)。
6. 现有 20 个源 HTML 与 git HEAD 相比零改动(`git diff --stat` 仅显示新增文件)。
7. `index.html` 仍是仓库根登录页,内容不变。
8. README.md 含「本地开发外壳」与「部署 dist/」说明。

## 10. 不做(Out of Scope)

- 不统一「哈希链」命名(后续独立任务)。
- 不引入 antd JS 库、不抽公共 CSS/JS。
- 不改 sessionStorage 鉴权流、不引入真实鉴权。
- 不改 20 页内部侧栏硬编码路径。
- 不做 viewer 与 iframe 的 postMessage 通信。
- 不做组件化改造(daqprototypev4 的 `src/components/` Web Components 方案本次不引入)。
