# SIDU-LATS Phase 2 FDA 合规原型图

> SIDU-LATS（Lightweight Audit Trail System）Phase 2 — FDA 21 CFR Part 11 合规版前端原型

## 预览

直接在浏览器打开 `index.html` 即可查看原型图（无需服务器）。

👉 **GitHub Pages 预览**：[https://yearsalso.github.io/sidu-lats-prototype](https://yearsalso.github.io/sidu-lats-prototype)

## 包含页面

| 页面 | 说明 |
|-----|------|
| 登录页 | 用户名/密码登录 |
| 仪表盘 | 状态总览/告警摘要/近期活动 |
| 审计日志 | 多维筛选/详情追溯/导出 |
| 哈希链管理 | Genesis Block/链可视化/验链 |
| 审批中心 | 待审列表/签名面板/审核流程 |
| 用户管理 | 用户CRUD/角色分配/权限矩阵 |
| 存储介质 | 介质台账/生命周期管理 |
| 报告导出 | 合规数据包导出配置 |

## 技术栈

- Vue 3 Composition API
- Ant Design Vue 4.x
- Pinia 状态管理
- Vite 构建风格（静态 HTML）

## 相关文档

- [需求文档](./需求文档.md)（在 SIDU-LATS 主项目中）
- [MVP 规划](./SIDU-LATS_Phase2_MVP_规划.md)

## 项目结构

```
sidu-lats-prototype/
├── index.html     # 原型图主文件（直接在浏览器打开）
└── README.md
```

## 合规说明

本原型对应的 SIDU-LATS Phase 2 系统目标满足：

- FDA 21 CFR Part 11 电子记录完整性
- ALCOA+ 数据完整性原则
- 四角色三权分立权限体系
- WORM 不可变存储架构
