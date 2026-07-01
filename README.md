# SIDU-LATS 原型图

缺陷识别数据存管系统（FDA 21 CFR Part 11 合规版）交互原型。

## 在线预览

**GitHub Pages**: https://yearsalso.github.io/sidu-lats-prototype/

直接访问上方链接即可在浏览器中体验完整原型，无需安装任何依赖。

## 页面说明

| 文件 | 说明 |
|-----|------|
| `login.html` | 登录页（入口） |
| `pages/dashboard.html` | 仪表盘 - 系统状态总览 |
| `pages/audit-log.html` | 审计日志 - 操作行为记录 |
| `pages/hash-chain.html` | 哈希链 - 数据完整性验证 |
| `pages/approval.html` | 审批中心 - 审批请求与签名 |
| `pages/user-management.html` | 用户管理 - 账户与权限 |
| `pages/storage.html` | 存储管理 - 容量与保留策略 |
| `pages/report-export.html` | 报告导出 - 合规报告生成 |

## 登录说明

- **用户名**：任意非空字符
- **密码**：任意 4 位以上字符

## 技术说明

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
