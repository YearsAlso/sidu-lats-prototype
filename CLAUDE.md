# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目性质

SIDU-LATS 是**缺陷识别数据存管系统**(FDA 21 CFR Part 11 合规版)的交互原型,部署在 GitHub Pages。**纯静态原型,无构建工具、无依赖、无测试套件、无 lint**。所有 20 个 HTML 文件均独立可运行。

## 常用命令

| 操作 | 方式 |
|------|------|
| 本地预览 | 浏览器直接打开 `index.html`(或 `pages/login.html` / `roles/*/admin-login.html`) |
| 部署预览 | 推送 `master` 分支即可触发 GitHub Pages |
| 登录测试 | 任意用户名 + 任意 ≥4 位密码 |
| 单页验证 | 打开目标 HTML → 点击侧栏菜单逐个跳转检查 |

无 `npm`/`build`/`test` 命令可用。若需要启动本地 HTTP 服务,用 `python3 -m http.server` 即可(可选,file:// 协议也支持 sessionStorage)。

## 文档目录(`docs/`)

`docs/` 是项目唯一的文档目录,按 SDD 工作流分层组织:

```
docs/
├── superpowers/
│   ├── specs/    ← 设计规范(Design spec,唯一可信源)
│   └── plans/    ← 实施计划(Implementation plan,checkbox 跟踪)
```

**约定:**

- 所有设计决策先落 `docs/superpowers/specs/<日期>-<主题>.md`,再产出 `docs/superpowers/plans/<日期>-<主题>.md`
- 改色组/改文案/改布局前**先查 `docs/superpowers/specs/`** 是否有对应规范,不允许即兴发挥视觉风格
- spec 是唯一可信源;plan 用 `- [ ]` checkbox 跟踪任务进度
- 历史规范归档不删,新规范在文件头部注明是否 supersede 旧规范

> ⚠️ **规范更替**:早期 `specs/2026-07-01-sidu-lats-deai-design.md`(去 AI 味/工程合规风)**已被废弃**。当前 UI 统一遵循 Ant Design(antd 5)规范,详见下文「UI 设计规范」。

## 目录结构

```
sidu-lats-prototype/
├── index.html                  ← 入口登录页(GitHub Pages 默认根)
├── pages/                      ← 主应用页面(11 个)
│   ├── dashboard.html          ← 仪表盘
│   ├── audit-log.html          ← 审计日志
│   ├── hash-chain.html         ← 哈希链校验
│   ├── approval.html           ← 审批中心(电子签名 ESig)
│   ├── user-management.html    ← 用户管理
│   ├── storage.html            ← 存储管理
│   ├── report-export.html      ← 报告导出
│   ├── notifications.html      ← 通知中心
│   ├── system-settings.html    ← 系统设置
│   ├── token-management.html   ← Token 管理
│   └── login.html              ← 备用登录页
├── roles/                      ← 4 个角色的独立入口(各 2 页 = 登录 + 仪表盘)
│   ├── admin/                  ← 管理员
│   ├── operator/               ← 操作员
│   ├── auditor/                ← 审计员
│   └── viewer/                 ← 查看者
├── docs/                       ← 文档目录(见上节)
└── .claude/agents/             ← 子代理定义(ui / reviewer)
```

## 子代理(Agents)

项目在 `.claude/agents/` 下定义了两个子代理,处理 UI 与审查工作。需要写/改页面视觉时**优先调用 `ui` agent**;改动完成后**调用 `reviewer` agent** 复核。

| Agent | 用途 | 何时调用 |
|-------|------|----------|
| `ui` | 按 antd 5 规范创建/修改页面视觉(CSS、布局、组件样式) | 新建页面、改色/间距/圆角/阴影/组件外观、迁移旧视觉 |
| `reviewer` | 复核改动是否符合项目约束(antd 规范、双击可跑、鉴权流、跳转路径) | 任意 HTML 改动完成后、提交前 |

## 核心架构约束

### 1. "双击可跑"原则(不可破坏)

每个 HTML 文件**必须保持完全自包含**——内联 `<style>` + 内联 `<script>`,**不抽公共 CSS/JS 文件**。这是因为项目承诺用户"双击 `index.html` 即可运行",不依赖任何构建产物或相对路径解析。

任何"重复代码 → 抽取共享文件"的提议都违反此约束,应拒绝。

### 2. 鉴权:sessionStorage mock

```js
sessionStorage.setItem('lats_logged_in', 'true');
sessionStorage.setItem('lats_user', username);
location.href = 'pages/dashboard.html';
```

无后端校验。任何用户名 + ≥4 位密码均通过。**不要**引入真实鉴权、token 校验或 HTTP 请求。

### 3. 页面间跳转用 `location.href`

所有页面跳转都是 `<a href>` 或 `onclick="location.href='...'"`。侧栏菜单是硬编码路径,改一个文件名要同步改所有引用。

## UI 设计规范(严格遵循 Ant Design / antd 5)

**UI 一律按 antd 5 设计规范实现,不自由发挥。** 详见 `.claude/agents/ui.md` 中的完整 token 表。核心要点:

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

- **电子签名 ESig**:PREVIEW / REVIEW / APPROVE / REJECT 四种意图分离(`pages/approval.html`)
- **哈希链**:SHA-256 链式完整性验证(`pages/hash-chain.html`)
- **审计日志**:ALCOA+ 合规记录(`pages/audit-log.html`)
- **审批流程**:双人知情配置变更(`pages/approval.html` + `pages/system-settings.html`)
- **报告导出**:带哈希+签名的合规报告(`pages/report-export.html`)

四角色分工:**Admin** 管配置/用户,**Operator** 录入数据,**Auditor** 查审计+哈希,**Viewer** 只读。

## 开发流程

遵循 SDD 工作流(`/openspec` 技能):

```
specs/ → plans/ → 修改 HTML(用 ui agent) → reviewer agent 复核 → 浏览器手测 → commit
```

## 修改页面时的检查清单

1. 保持内联 `<style>`,**不引入外部 CSS/JS 文件**
2. 视觉严格遵循 antd 5 token(见上),改动量大时调用 `ui` agent
3. 侧栏菜单路径是否仍指向现有文件(改文件名要全文同步)
4. `sessionStorage` 鉴权流不要改(`lats_logged_in` / `lats_user`)
5. 浏览器手动验证:登录 → 跳转到目标页 → 点击侧栏其他菜单可达
6. 提交前调用 `reviewer` agent 复核约束合规性
7. README.md 同步更新"页面说明"表格