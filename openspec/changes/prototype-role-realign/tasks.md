# 实施任务清单

> 对应 `docs/superpowers/plans/2026-07-02-prototype-role-realign.md` 的 T1-T28,按阶段分组。每阶段完成独立 commit。

## 1. 删除越权/无依据页面(阶段 1)

- [ ] 1.1 备份 `prototype/admin/approval.html` 到 `/tmp/admin-approval-ref.html`(供 reviewer 迁移 ESig 逻辑参考)
- [ ] 1.2 `git rm -r prototype/viewer/`(11 页:login/dashboard/audit-log/hash-chain/approval/user-mgmt/token-mgmt/system-settings/storage/report-export/notifications)
- [ ] 1.3 `git rm prototype/operator/audit-log.html prototype/operator/approval.html prototype/operator/report-export.html`
- [ ] 1.4 `git rm prototype/auditor/approval.html`
- [ ] 1.5 `git rm prototype/admin/approval.html prototype/admin/audit-log.html prototype/admin/hash-chain.html`
- [ ] 1.6 commit 阶段 1

## 2. 新建 reviewer 角色(阶段 2)

- [ ] 2.1 创建 `prototype/reviewer/login.html` — 设 `lats_role='reviewer'`/`lats_role_name='报告审核员'`,跳 `dashboard.html`;切换卡片含 admin/operator/auditor(无 viewer)
- [ ] 2.2 创建 `prototype/reviewer/dashboard.html` — 侧栏 2 项(仪表盘 active + 审批中心),展示待复核/已批准/已驳回统计
- [ ] 2.3 创建 `prototype/reviewer/approval.html` — 迁移 `/tmp/admin-approval-ref.html` 的 ESig 四意图(PREVIEW/REVIEW/APPROVE/REJECT)+ 二次凭证校验(与 `lats_user` 一致)+ 留痕;文案调整为"报告复核"语境
- [ ] 2.4 commit 阶段 2

## 3. 新建 operator 数据录入页(阶段 3)

- [ ] 3.1 创建 `prototype/operator/data-entry.html` — NTA 文件选择/拖拽区(mock)+ 基础录入表单(批次/样本/检测项,必填校验)+ 提交留痕;无审批/导出/签名入口
- [ ] 3.2 commit 阶段 3

## 4. 新建 auditor 权限复审页(阶段 4)

- [ ] 4.1 创建 `prototype/auditor/permission-review.html` — 只读表格(用户名/角色/权限范围/最后复审日期)+ 按角色筛选(antd Form+Select 视觉);无编辑入口
- [ ] 4.2 commit 阶段 4

## 5. 复制 auditor storage/report-export(阶段 5)

- [ ] 5.1 复制 `prototype/admin/storage.html` → `prototype/auditor/storage.html`,改只读:隐藏备份/配置按钮,保留存储分布/健康/介质抽检;侧栏高亮 storage
- [ ] 5.2 复制 `prototype/admin/report-export.html` → `prototype/auditor/report-export.html`,只留合规报告类型,隐藏日志型导出;侧栏高亮 report-export
- [ ] 5.3 commit 阶段 5

## 6. 修改各角色 login + dashboard 侧栏(阶段 6)

- [ ] 6.1 `prototype/admin/login.html` 切换卡片:去 viewer、加 reviewer(含 auditor/operator/reviewer)
- [ ] 6.2 `prototype/operator/login.html` 切换卡片:去 viewer、加 reviewer
- [ ] 6.3 `prototype/auditor/login.html` 切换卡片:去 viewer、加 reviewer
- [ ] 6.4 `prototype/admin/dashboard.html` 侧栏重排为 8 项:仪表盘/用户管理/Token管理/系统设置/存储管理/报告导出/通知中心 + 退出(去 approval/audit-log/hash-chain)
- [ ] 6.5 `prototype/operator/dashboard.html` 侧栏重排为 3 项:仪表盘/数据录入 + 退出
- [ ] 6.6 `prototype/auditor/dashboard.html` 侧栏重排为 6 项:仪表盘/审计日志/哈希链/存储管理/报告导出/权限复审 + 退出(去 approval)
- [ ] 6.7 commit 阶段 6

## 7. 构建配置 + 文档同步(阶段 7)

- [ ] 7.1 `vite.config.js` — 移除 viewer/* + operator(audit-log/approval/report-export)+ auditor/approval + admin(approval/audit-log/hash-chain)入口;新增 reviewer/(login/dashboard/approval)+ operator/data-entry + auditor/permission-review + auditor/storage + auditor/report-export 入口
- [ ] 7.2 `src/viewer/prototype-pages.js` — 角色演示组改为 admin(8)/auditor(6)/reviewer(3)/operator(3);DEFAULT_PAGE 保持 `prototype/index.html`
- [ ] 7.3 `docs/Index.md` 第 25 行四角色概括修正为"系统管理员/QA审计员/报告审核员/普通操作员"
- [ ] 7.4 `CLAUDE.md` 业务流程章节同步:去 viewer、加 reviewer、admin 职能改为配置/用户/存储/日志导出
- [ ] 7.5 commit 阶段 7

## 8. 验证(阶段 8)

- [ ] 8.1 `npm run build` 通过,产物无 viewer/、无越权页
- [ ] 8.2 全仓扫描 `viewer` 残留引用(应仅在历史 `docs/superpowers/` 归档中)
- [ ] 8.3 各角色 login → dashboard → 侧栏菜单全链路跳转可达,sessionStorage 鉴权不丢
- [ ] 8.4 调用 `prototype-syntax-reviewer` 审核新建 5 页(reviewer 3 + data-entry + permission-review)HTML 语法 + JS 逻辑
- [ ] 8.5 调用 `prototype-code-reviewer` 复核新建页项目约束(antd 视觉/自包含/鉴权流/跳转路径/输入校验)
- [ ] 8.6 浏览器手测四角色全链路(登录→仪表盘→各功能页→留痕),确认无死链、无越权入口
- [ ] 8.7 最终 commit(若验证发现修复项)
