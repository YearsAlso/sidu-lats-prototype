# SIDU-LATS 原型图

缺陷识别数据存管系统（FDA 21 CFR Part 11 合规版）交互原型。

## 在线预览

**GitHub Pages**: https://yearsalso.github.io/sidu-lats-prototype/

直接访问上方链接即可在浏览器中体验完整原型，无需安装任何依赖。

## 页面说明

| 路径 | 说明 |
|-----|------|
| `index.html` | 根入口(GH Pages 入口,自动跳转 → prototype/index.html) |
| `prototype/index.html` | **角色演示入口** — 按权限隔离的 4 角色原型 |
| `prototype/admin/` | 系统管理员（11 页,全功能 10 项侧栏） |
| `prototype/operator/` | 操作员（5 页,侧栏 4 项） |
| `prototype/auditor/` | QA 审计员（6 页,侧栏 5 项） |
| `prototype/viewer/` | 查看者（11 页,只读仪表盘 + 9 页无权限） |

## 登录说明

- **用户名**：任意非空字符
- **密码**：任意 4 位以上字符

## 本地开发外壳 (Vite Viewer)

提供侧栏分组导航 + iframe 预览,方便在 prototype/ 34 个原型页之间快速切换。

```bash
npm install
npm run dev
```

浏览器自动打开 `http://localhost:5173/viewer.html`,左侧两组导航(入口/角色演示),搜索可用。
各原型页保持不变,仍可双击单独打开。

### 构建与部署

```bash
npm run build    # 产出 dist/ 目录
npm run preview  # 本地预览构建产物
```

生产部署时将 `dist/` 目录推送至 GitHub Pages 部署源。

- 纯原生 HTML + CSS + JavaScript，无框架依赖
- 无需构建工具，双击 `login.html` 即可运行（本地模式）
- 使用 `sessionStorage` 模拟登录状态

## 分支说明

- `master` 分支：可直接访问的 GitHub Pages 预览版本
- 源代码变更请提交到 `src/` 子目录

## 合规功能演示

本原型涵盖以下 FDA 21 CFR Part 11 合规功能：

- 🔐 电子签名（ESig）：PREVIEW / REVIEW / APPROVE / REJECT 意图分离
- 🔗 哈希链：SHA-256 数据完整性验证
- 📋 审计日志：ALCOA+ 合规操作记录
- ✅ 审批流程：双人知情的配置变更审批
- 📥 报告导出：带哈希和签名的合规报告
