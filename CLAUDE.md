# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目性质

SIDU-LATS 是**缺陷识别数据存管系统**(FDA 21 CFR Part 11 合规版)的交互原型,部署在 GitHub Pages。**纯静态原型,无构建工具、无依赖、无测试套件、无 lint**。所有 20 个 HTML 文件均独立可运行。

## 常用命令

| 操作 | 方式 |
|------|------|
| 本地预览 | 浏览器直接打开 `index.html`(自动跳转 → `prototype/index.html` 选角色 → `prototype/<role>/login.html`) |
| 部署预览 | 推送 `master` 分支即可触发 GitHub Pages |
| 登录测试 | 任意用户名 + 任意 ≥4 位密码 |
| 单页验证 | 打开目标 HTML → 点击侧栏菜单逐个跳转检查 |

无 `npm`/`build`/`test` 命令可用。若需要启动本地 HTTP 服务,用 `python3 -m http.server` 即可(可选,file:// 协议也支持 sessionStorage)。

## 文档与 spec 目录

项目有两类文档目录:**`docs/` 放产品/需求/技术文档**,**`openspec/` 放 SDD 工作流产物**(强制)。

```
docs/
├── Index.md                                  ← 文档清单与状态(入口)
├── 需求文档.md                                ← 🥇 PRD V3.0,需求冻结,唯一需求事实源
├── SIDU-LATS_Phase2_MVP_规划.md              ← MVP 范围、Sprint、用户故事
├── SIDU-LATS_Phase2_技术架构文档.md           ← 总体架构、API、Schema
├── SIDU-LATS_Phase2_MVP_技术实现路径.md       ← 详细实现路径、代码骨架
└── superpowers/                              ← 历史视觉规范(antd 迁移、deai 已废弃等)
    ├── specs/    ← 早期 design spec
    └── plans/    ← 早期 implementation plan

openspec/                                      ← ★ SDD 强制目录(/openspec 技能落地)
├── specs/                                     ← ✅ 正式 spec 唯一可信源(*.spec.md)
└── changes/[id]/                              ← 变更工作区(proposal/design/delta spec/tasks)
```

**约定:**

- `需求文档.md` 是**冻结的需求事实源**(V3.0,含 M1-M6 模块、权限矩阵、WORM/哈希链、电子签名 ESig 规范、ALCOA+)。任何功能是否符合需求的判断,以它为准——需求符合性审查由 `pm` agent 执行
- **新功能/修改/重构/bug 修复一律走 `openspec/`**(`/opsx:propose` → ... → `/opsx:archive`),`openspec/specs/` 是正式 spec 唯一可信源
- `docs/superpowers/specs/` 是早期视觉规范,仅作历史参考;新工作不再写这里,改写 `openspec/changes/`
- 改色组/改文案/改布局前**先查 `openspec/specs/` 与 `docs/superpowers/specs/`** 是否有对应规范,不允许即兴发挥视觉风格
- 历史规范归档不删,新规范在文件头部注明是否 supersede 旧规范

> ⚠️ **规范更替**:早期 `docs/superpowers/specs/2026-07-01-sidu-lats-deai-design.md`(去 AI 味/工程合规风)**已被废弃**。当前 UI 统一遵循 Ant Design(antd 5)规范,详见下文「UI 设计规范」与 `.claude/agents/prototype-ui-reviewer.md`。

## 目录结构

```
sidu-lats-prototype/
├── index.html                  ← 根入口(GitHub Pages 默认根,自动跳转 → prototype/index.html)
├── prototype/                  ← ★ 唯一原型图目录(34 个 HTML)
│   ├── index.html              ← 角色演示入口(选择 4 角色之一)
│   ├── admin/                  ← 系统管理员(11 页,全功能 10 项侧栏)
│   ├── operator/               ← 操作员(5 页,侧栏 4 项)
│   ├── auditor/                ← QA 审计员(6 页,侧栏 5 项)
│   └── viewer/                 ← 查看者(11 页,只读仪表盘 + 9 页无权限)
├── viewer.html + src/viewer/   ← Vite 开发导航器外壳(可选,非原型)
├── docs/                       ← 文档目录(见上节)
└── .claude/agents/             ← 子代理定义(pm / prototype-ui-reviewer / prototype-code-reviewer / prototype-syntax-reviewer / commit-writer)
```

> ℹ️ 原型页面统一收归 `prototype/` 目录,按角色子目录隔离权限范围。根 `index.html` 仅作 GH Pages 入口跳转。历史的 `pages/` 与 `roles/` 已删除。

## 子代理(Agents)

项目在 `.claude/agents/` 下定义了五个子代理,覆盖需求审查、UI 实现、约束复核、语法逻辑审核、提交撰写。典型流程:**新增功能或修改需求时先用 `pm` agent 审核逻辑、产出 antd 方案** → 写/改页面视觉用 `prototype-ui-reviewer` agent → 改动完成后用 `prototype-code-reviewer` 复核项目约束、用 `prototype-syntax-reviewer` 审核语法与 JS 逻辑 → 提交用 `commit-writer` agent。

| Agent | 用途 | 何时调用 |
|-------|------|----------|
| `pm` | 阅读 `docs/` 需求文档/PRD,审核原型页面逻辑是否满足需求,产出 antd 设计准则下的调整方案 | 新增功能、提出修改意见、需求符合性审查、迭代方案设计 |
| `prototype-ui-reviewer` | 按 antd 5 规范创建/修改页面视觉(CSS、布局、组件样式) | **仅当 `prototype/**/*.html` 需视觉改动时**;新建页面、改色/间距/圆角/阴影/组件外观、迁移旧视觉 |
| `prototype-code-reviewer` | 复核改动是否符合项目约束(antd 规范、双击可跑、鉴权流、跳转路径、DOM/数据完整性、**输入框有效值审核**) | **仅当 `prototype/**/*.html` 改动后**、提交前 |
| `prototype-syntax-reviewer` | 审核纯 HTML 语法与内联 JS 逻辑正确性(标签闭合、JS 语法、未定义变量、事件/DOM 绑定、合并冲突残留) | **仅当 `prototype/**/*.html` 改动后**、排查页面不工作时 |
| `commit-writer` | 撰写规范的 git commit message | 提交代码时 |

> ⚠️ **触发边界**:`prototype-ui-reviewer` / `prototype-code-reviewer` / `prototype-syntax-reviewer` 三个 agent **只在 `prototype/` 目录下 HTML 改动时启用**。`src/`(Vite 外壳)、`dist/`(构建产物)、根 `index.html`/`viewer.html`、`package.json` 的改动不触发这三个 agent——它们不属于原型图范畴。

## 核心架构约束

### 1. "双击可跑"原则(不可破坏)

每个 HTML 文件**必须保持完全自包含**——内联 `<style>` + 内联 `<script>`,**不抽公共 CSS/JS 文件**。这是因为项目承诺用户"双击 `index.html` 即可运行",不依赖任何构建产物或相对路径解析。

任何"重复代码 → 抽取共享文件"的提议都违反此约束,应拒绝。

### 2. 鉴权:sessionStorage mock

```js
sessionStorage.setItem('lats_logged_in', 'true');
sessionStorage.setItem('lats_user', username);
sessionStorage.setItem('lats_role', 'admin');        // 角色登录页额外设角色
sessionStorage.setItem('lats_role_name', '管理员');
location.href = 'dashboard.html';                    // 同目录跳转(prototype/<role>/ 内)
```

无后端校验。任何用户名 + ≥4 位密码均通过。**不要**引入真实鉴权、token 校验或 HTTP 请求。角色登录页(`prototype/<role>/login.html`)在登录时额外写入 `lats_role` / `lats_role_name`,各功能页据此做菜单可见性与按钮可用性控制。

### 3. 页面间跳转用 `location.href`

所有页面跳转都是 `<a href>` 或 `onclick="location.href='...'"`。侧栏菜单是硬编码路径,改一个文件名要同步改所有引用。

### 4. 最小改动原则(Minimal Change)

所有代码修改与执行计划必须控制在最小半径内:

- **局部修补优先**:改一个文件能解决的,不做多文件替换。扩展现有结构,不推翻重建。
- **改动半径 ≤3 文件或 ≤50 行可执行**;超过此阈值必须先产出方案文档(含改动范围矩阵)并获用户确认。
- **聚焦用户要求**:不顺手"优化"无关区域,不改其他页面的相同模式(除非用户明确要求全量统一)。
- **独立可回滚**:每批改动独立 commit,改完验证再继续。batch/bulk 操作(如 20 文件全局 token 替换)必须先获用户确认。

详见 `.claude/rules/working-rules.md` §7。

### 5. 强制 SDD / OpenSpec(不可跳过)

任何新功能、修改、重构、bug 修复**必须先走 `/openspec` 流程**:`/opsx:propose`(proposal 获用户确认)→ `/opsx:ff`(出 design + delta spec + tasks)→ `/opsx:apply` → `/opsx:verify` → `/opsx:archive`。**无 spec 不编码**;spec 五要素齐全(功能描述/输入约束/输出约束/边界条件/验收标准)。详见下文「开发流程」。

## UI 设计规范(严格遵循 Ant Design / antd 5)

**UI 一律按 antd 5 设计规范实现,不自由发挥。** 详见 `.claude/agents/prototype-ui-reviewer.md` 中的完整 token 表。核心要点:

### 色彩 token

| 用途 | antd 5 值 |
|------|-----------|
| 主色 Primary | `#1677ff` |
| 主色 hover | `#4096ff` |
| 主色 active | `#0958d9` |
| 主色浅底(选中/hover bg) | `#e6f4ff` |
| 页面底色 | `#f5f5f5` |
| 卡片白底 | `#ffffff` |
| 表头底 | `#fafafa` |
| 分隔线 | `#f0f0f0` |
| 边框 | `#d9d9d9` |
| 主文本 | `rgba(0, 0, 0, 0.88)` |
| 副文本 | `rgba(0, 0, 0, 0.65)` |
| 弱化文本 | `rgba(0, 0, 0, 0.45)` |
| 成功 success | `#52c41a` / 浅底 `#f6ffed` / 描边 `#b7eb8f` |
| 警告 warning | `#faad14` / 浅底 `#fffbe6` / 描边 `#ffe58f` |
| 错误 error | `#ff4d4f` / 浅底 `#fff2f0` / 描边 `#ffccc7` |
| 信息 info | `#1677ff` / 浅底 `#e6f4ff` / 描边 `#91caff` |

### 字体

```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'
```

代码/哈希值等宽字段:`'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`。

### 间距与圆角(antd 5)

- 基础间距单位 8 的倍数:4 / 8 / 12 / 16 / 24
- 圆角:`4px`(按钮/输入)、`6px`(小卡片)、`8px`(主卡片/模态框)、`2px`(tag/hash chip)
- 阴影:卡片 `0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)`;浮层 `0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)`

### 组件对照

侧栏菜单 → antd `Menu`、卡片 → `Card`、统计块 → `Statistic`、表格 → `Table`、筛选栏 → `Form` + `Input`/`Select`、标签 → `Tag`、按钮 → `Button`(`primary`/`default`/`text`)。实现时按 antd 组件的视觉结构还原,不引入 antd JS 库(纯 CSS 还原)。

### 迁移说明

代码库中现存的 `#1890ff`(antd 4 主色)等旧值,在改动对应文件时应迁移到 antd 5 token(`#1890ff` → `#1677ff`)。**禁止**保留紫青渐变(`#667eea → #764ba2`)、emoji 侧栏图标、超大圆角立体阴影——这些不属于 antd 规范。

## 业务流程

合规演示围绕 4 个 FDA 21 CFR Part 11 关键能力:

- **电子签名 ESig**:PREVIEW / REVIEW / APPROVE / REJECT 四种意图分离(`prototype/admin/approval.html`)
- **哈希链**:SHA-256 链式完整性验证(`prototype/admin/hash-chain.html`)
- **审计日志**:ALCOA+ 合规记录(`prototype/admin/audit-log.html`)
- **审批流程**:双人知情配置变更(`prototype/admin/approval.html` + `prototype/admin/system-settings.html`)
- **报告导出**:带哈希+签名的合规报告(`prototype/admin/report-export.html`)

四角色分工:**Admin** 管配置/用户,**Operator** 录入数据,**Auditor** 查审计+哈希,**Viewer** 只读。

## 开发流程(强制 SDD / OpenSpec)

本项目**强制执行 Spec-Driven Development(SDD)**,通过 `/openspec` 技能与 `openspec/` 目录落地。**无 spec 不编码**——任何新功能、修改、重构、bug 修复,都必须先产出 spec,经用户确认后再实现。

### SDD 五阶段(不可跳过)

```
1. Propose  → /opsx:propose   生成 proposal.md(为什么改、改什么、影响范围),用户确认
2. Spec     → /opsx:ff        生成 design.md + delta spec + tasks.md(spec 五要素:功能描述/输入约束/输出约束/边界条件/验收标准)
3. Apply    → /opsx:apply     严格按 spec 实现,不得偏离;实现委托 prototype-ui-reviewer agent
4. Verify   → /opsx:verify    代码与 spec 一致性校验;不通过则回修
5. Archive  → /opsx:archive   delta spec 合并进 openspec/specs/,清理 changes/
```

- **新需求/功能**:走完整 5 阶段(Propose → Archive)
- **Bug/优化**:`/opsx:explore` 输出问题分析 + 修复 spec → Apply → Verify → Archive
- **需求符合性**:实现前用 `pm` agent 审核逻辑、产出 antd 方案(对照 `docs/需求文档.md` 冻结 PRD)

### 目录规范

| 目录 | 用途 | 说明 |
|------|------|------|
| `openspec/specs/` | ✅ 正式 spec 唯一可信源 | `*.spec.md`,所有已归档的变更最终落这里 |
| `openspec/changes/[id]/` | 变更工作区 | proposal.md / design.md / specs delta / tasks.md |
| `docs/superpowers/specs/` + `plans/` | 历史视觉规范与实施计划 | 早期 SDD 产物(antd 迁移、deai 已废弃等),新工作改走 `openspec/` |
| `docs/需求文档.md` | 🥇 需求事实源 | PRD V3.0 冻结,判断"功能是否符合需求"的最终依据 |

> ❌ **禁止**在 `src/`、`prototype/`、根目录放置正式 spec;❌ **禁止**跳过流程直接写实现代码;❌ **禁止**在 spec 外定义接口签名或数据结构。

### 与 prototype agent 的衔接

SDD 的 Apply 阶段委托 prototype 专项 agent 执行,且这些 agent **仅在 `prototype/**/*.html` 改动时启用**:

```
Propose → Spec → pm agent 审需求符合性
             → Apply: prototype-ui-reviewer 改视觉
             → Verify: prototype-code-reviewer 复核约束(含输入框有效值) + prototype-syntax-reviewer 审语法逻辑
             → 浏览器手测
             → Archive → commit(commit-writer agent)
```

> 每批改动遵守最小改动原则(见核心约束 §4):≤3 文件/≤50 行可直接执行,超过须先出方案文档获用户确认;每批独立 commit。

## 修改页面时的检查清单

1. **SDD 前置**:改动前先走 `/openspec`——`/opsx:propose` 出 proposal 获用户确认,`/opsx:ff` 出 spec+tasks。无 spec 不编码
2. **需求符合性**:用 `pm` agent 对照 `docs/需求文档.md` 审核逻辑、产出 antd 方案
3. 保持内联 `<style>`,**不引入外部 CSS/JS 文件**
4. 视觉严格遵循 antd 5 token(见上),改动量大时调用 `prototype-ui-reviewer` agent
5. 侧栏菜单路径是否仍指向现有文件(改文件名要全文同步)
6. `sessionStorage` 鉴权流不要改(`lats_logged_in` / `lats_user`)
7. 浏览器手动验证:登录 → 跳转到目标页 → 点击侧栏其他菜单可达
8. **Verify**:`/opsx:verify` + `prototype-code-reviewer` 复核约束(含输入框有效值) + `prototype-syntax-reviewer` 审核 HTML 语法与 JS 逻辑
9. **Archive**:`/opsx:archive` 合并 delta spec,README.md 同步"页面说明"表格,`commit-writer` agent 撰写提交