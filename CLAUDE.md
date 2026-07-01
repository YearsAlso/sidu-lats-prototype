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

## 目录结构与文件组织

```
sidu-lats-prototype/
├── index.html                  ← 入口登录页(GitHub Pages 默认根)
├── pages/                      ← 主应用页面(11 个)
│   ├── dashboard.html          ← 仪表盘(出现频率最高的样式基线)
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
└── docs/superpowers/           ← SDD 工作流产物
    ├── specs/                  ← 设计规范
    └── plans/                  ← 实施计划
```

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

### 4. CSS 规范(参见 `docs/superpowers/specs/2026-07-01-sidu-lats-deai-design.md`)

工程合规风色组(已固化):

| 用途 | 颜色 |
|------|------|
| 主色 | `#1f3a5f`(深蓝灰) |
| 主色 hover | `#2d5483` |
| 页面底色 | `#f4f5f7` |
| 主文本 | `#1f2937` |
| 成功 | `#0f7b3a` |
| 警告 | `#a36404` |
| 错误 | `#b3261e` |

字体栈:`-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif`。
等宽字段(哈希值/版本号):`'SF Mono', ui-monospace, 'Cascadia Mono', Menlo, monospace`。
圆角整体收窄(8px→6px、12px→4px),阴影改近平面(`0 1px 0 rgba(15,23,42,0.04)`)。
**禁止**再用 Ant Design 蓝(`#1890ff`)、紫青渐变(`#667eea → #764ba2`)、大圆角立体阴影、侧栏 emoji。

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
specs/ → plans/ → 修改 HTML → 浏览器手测 → commit
```

计划文档用 checkbox 跟踪(`- [ ]`),specs 是唯一可信源。**改色组/改文案/改布局前先看 `docs/superpowers/specs/` 下是否有对应规范**,不允许即兴发挥视觉风格。

## 修改页面时的检查清单

1. 保持内联 `<style>`,**不引入外部 CSS/JS 文件**
2. 使用 `docs/superpowers/specs/` 已固化的色组与字体栈
3. 侧栏菜单路径是否仍指向现有文件(改文件名要全文同步)
4. `sessionStorage` 鉴权流不要改(`lats_logged_in` / `lats_user`)
5. 浏览器手动验证:登录 → 跳转到目标页 → 点击侧栏其他菜单可达
6. README.md 同步更新"页面说明"表格