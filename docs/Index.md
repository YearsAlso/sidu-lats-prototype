# SIDU-LATS Phase 2 项目文档

> 缺陷识别数据存证系统 · FDA 21 CFR Part 11 合规版

---

## 文档列表

| # | 文档名 | 说明 | 状态 |
|---|--------|------|------|
| 1 | [需求文档.md](./需求文档.md) | 产品需求规格说明书，含 M1-M6 模块、权限矩阵、WORM/哈希链设计、电子签名规范 | ✅ 需求冻结 |
| 2 | [SIDU-LATS_Phase2_MVP_规划.md](./SIDU-LATS_Phase2_MVP_规划.md) | MVP 功能规划、Sprint 拆分、用户故事地图 | 📋 初稿 |
| 3 | [SIDU-LATS_Phase2_技术架构文档.md](./SIDU-LATS_Phase2_技术架构文档.md) | 总体架构、API 设计、数据库 Schema、C# 实现方案 | ✅ 架构冻结 |
| 4 | [SIDU-LATS_Phase2_MVP_技术实现路径.md](./SIDU-LATS_Phase2_MVP_技术实现路径.md) | 详细实现路径、API 清单、SQLite Schema、C# 代码骨架 | 🔄 开发中 |

---

## 文档摘要

### 需求文档.md
- V3.0（Phase 2 FDA 合规版），2026-07-01 编写
- 产品定位：面向 FDA 21 CFR Part 11 的轻量级 B/S 审计追踪系统
- 技术栈：Vue 3 + Ant Design Vue · C# .NET 8 · SQLite + JSONL 哈希链
- 6 大功能模块：审计日志 / 哈希链验证 / 电子签名 / 报告导出 / 用户管理 / 存储管理
- 权限体系：四角色三权分立（管理员/审计员/操作员/查看者）
- WORM 存储：NTFS ACL 只读 + VSS 影子复制 + 蓝光离线归档

### SIDU-LATS_Phase2_MVP_规划.md
- MVP 定义：6 模块 MVP，4 个 Sprint，36 个功能点
- Sprint 1：账户系统 + 审计日志 + 哈希链基础
- Sprint 2：WORM 存储 + 电子签名
- Sprint 3：审批流程 + 通知系统
- Sprint 4：报告导出 + FDA 合规验证

### SIDU-LATS_Phase2_技术架构文档.md
- 总体架构：Vue3 B/S 前端 + ASP.NET Core 后端 + SQLite 本地存储
- 账户体系：纯软件自建，Argon2id 密码哈希，独立于 OS 账户
- 电子签名：FDA 合规四级签名意图（PREVIEW/REVIEW/APPROVE/REJECT）+ CA 证书
- 密钥存储：C# CNG / Java PKCS#11 / 硬件 TPM

### SIDU-LATS_Phase2_MVP_技术实现路径.md
- SQLite Schema 详细设计
- C# ASP.NET Core API 实现路径
- Token 认证方案（JWT Bearer）
- 哈希链 + WORM 存储实现细节

---

## 版本历史

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-07-01 | V3.0 | Phase 2 需求文档全面重写，升级为 FDA 21 CFR Part 11 合规版 |
| 2026-06-30 | V2.0 | Phase 1 需求文档，Windows 单机 exe 定位 |

---

## 相关链接

- [原型图 GitHub Pages](https://yearsalso.github.io/sidu-lats-prototype/)
- [原型图仓库](https://github.com/YearsAlso/sidu-lats-prototype)
- [项目源文档（Obsidian）](../15-SIDU-LATS/)
