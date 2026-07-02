# SIDU-LATS 原型角色对齐需求 — 实施计划

**日期**: 2026-07-02
**背景**: 需求文档 V3.0(冻结)§1.4/§6.1/§6.2 定义四角色三权分立:`SYS_ADMIN / QA_AUDITOR / REVIEWER / OPERATOR`。当前原型实现为 `admin/operator/auditor/viewer`,存在三处偏离:
1. `viewer` 角色需求文档未定义(原型多加)
2. `REVIEWER`(报告审核员)角色缺失(原型未实现)
3. 各角色页面归属与 §6.2 权限矩阵不符(admin 越权做了审批/哈希;operator 越权做了审计/审批/导出;auditor 越权做了审批)

**目标**: 原型角色模型对齐为 `admin/operator/auditor/reviewer`,页面归属严格按权限矩阵,admin 禁止数据修改/报告签名。

## 角色职能边界(已与用户确认)

| 级别 | 角色 | 代码 | 核心职能 | 禁止 |
|---|---|---|---|---|
| 一级 | 系统管理员 | SYS_ADMIN | 用户管理、系统配置、WORM存储/介质管理、日志备份导出 | 报告签名、数据修改 |
| 二级 | QA审计员 | QA_AUDITOR | 审计日志校验、哈希核验、介质抽检、权限复审 | 系统配置、数据录入审批 |
| 三级 | 报告审核员 | REVIEWER | 报告复核、电子签名、驳回修改 | 账号管理、系统底层配置 |
| 四级 | 普通操作员 | OPERATOR | NTA原始数据上传、基础数据录入、自有数据查询 | 审批、导出、签名 |

> 无超级管理员层级。四角色硬隔离,禁止一人兼任(§6.3)。

## 角色 → 页面映射(目标态)

| 页面 | admin | auditor | reviewer | operator | 依据 |
|---|:---:|:---:|:---:|:---:|---|
| login + dashboard | ✅ | ✅ | ✅ | ✅ | 通用入口 |
| user-management | ✅ | ❌ | ❌ | ❌ | 账号管理=admin独占 |
| system-settings | ✅ | ❌ | ❌ | ❌ | 系统底层配置=admin独占 |
| token-management | ✅ | ❌ | ❌ | ❌ | API Token=系统配置类 |
| storage | ✅ | ✅只读 | ❌ | ❌ | admin管WORM/备份;auditor介质抽检(只读) |
| report-export | ✅日志型 | ✅合规型 | ❌ | ❌ | admin导日志,auditor导合规报告 |
| audit-log | ❌ | ✅ | ❌ | ❌ | 日志校验=auditor |
| hash-chain | ❌ | ✅ | ❌ | ❌ | 哈希核验=auditor |
| approval | ❌ | ❌ | ✅ | ❌ | 报告复核+电子签名=reviewer |
| notifications | ✅ | ❌ | ❌ | ❌ | 系统告警(含越权)=admin |
| data-entry | ❌ | ❌ | ❌ | ✅ | operator NTA上传+录入 |
| permission-review | ❌ | ✅ | ❌ | ❌ | auditor 权限复审只读 |

## 任务清单

### 阶段 1:删除越权/无依据页面(18 页)

- [ ] T1 `git rm -r prototype/viewer/`(11 页:login/dashboard/audit-log/hash-chain/approval/user-mgmt/token-mgmt/system-settings/storage/report-export/notifications)— 无需求依据
- [ ] T2 `git rm prototype/operator/audit-log.html prototype/operator/approval.html prototype/operator/report-export.html` — operator 无审计/审批/导出权限
- [ ] T3 `git rm prototype/auditor/approval.html` — 审核权归 reviewer
- [ ] T4 `git rm prototype/admin/approval.html prototype/admin/audit-log.html prototype/admin/hash-chain.html` — admin 不碰数据修改/审批/哈希校验

### 阶段 2:新建 reviewer 角色(3 页)

- [ ] T5 创建 `prototype/reviewer/login.html` — 设 `lats_role='reviewer'`/`lats_role_name='报告审核员'`,跳 `dashboard.html`;切换角色卡片去 viewer、加其他三角色
- [ ] T6 创建 `prototype/reviewer/dashboard.html` — 侧栏 2 项:仪表盘(active) + 审批中心;展示待复核报告队列统计
- [ ] T7 创建 `prototype/reviewer/approval.html` — 报告复核 + 电子签名 ESig 四意图(PREVIEW/REVIEW/APPROVE/REJECT)+ 驳回修改流程;二次凭证输入;留痕

### 阶段 3:新建 operator 数据录入页(1 页)

- [ ] T8 创建 `prototype/operator/data-entry.html` — NTA 原始数据上传(文件选择+拖拽)+ 基础数据录入表单(批次/样本/检测项);提交后留痕;无审批/导出/签名按钮

### 阶段 4:新建 auditor 权限复审页(1 页)

- [ ] T9 创建 `prototype/auditor/permission-review.html` — 只读列出用户清单(用户名/角色/权限范围/最后复审日期);无编辑按钮;支持按角色筛选

### 阶段 5:复制 + 调整 auditor 的 storage/report-export(2 页)

- [ ] T10 复制 `prototype/admin/storage.html` → `prototype/auditor/storage.html`,改只读:隐藏"备份"/"配置"按钮,保留存储分布/健康/介质抽检视图;侧栏高亮 storage
- [ ] T11 复制 `prototype/admin/report-export.html` → `prototype/auditor/report-export.html`,只留"合规报告"类型,隐藏"日志型"导出;侧栏高亮 report-export

### 阶段 6:修改各角色 login 切换卡片 + dashboard 侧栏

- [ ] T12 `prototype/admin/login.html` — 切换角色卡片:去 viewer、加 reviewer(auditor/operator/reviewer)
- [ ] T13 `prototype/operator/login.html` — 切换卡片:去 viewer、加 reviewer
- [ ] T14 `prototype/auditor/login.html` — 切换卡片:去 viewer、加 reviewer
- [ ] T15 `prototype/admin/dashboard.html` — 侧栏重排为 8 项:仪表盘/用户管理/Token管理/系统设置/存储管理/报告导出/通知中心 + 退出(去 approval/audit-log/hash-chain)
- [ ] T16 `prototype/operator/dashboard.html` — 侧栏重排为 3 项:仪表盘/数据录入 + 退出(去 audit-log/approval/report-export)
- [ ] T17 `prototype/auditor/dashboard.html` — 侧栏重排为 6 项:仪表盘/审计日志/哈希链/存储管理/报告导出/权限复审 + 退出(去 approval)
- [ ] T18 `prototype/reviewer/dashboard.html` 已在 T6 处理

### 阶段 7:构建配置 + 文档同步

- [ ] T19 `vite.config.js` — 移除 viewer/* + operator(audit-log/approval/report-export)+ auditor/approval + admin(approval/audit-log/hash-chain)入口;新增 reviewer/* + operator/data-entry + auditor/permission-review 入口
- [ ] T20 `src/viewer/prototype-pages.js` — 同步分组:角色演示组改为 admin(8)/auditor(6)/reviewer(3)/operator(3)
- [ ] T21 `docs/Index.md` 第 25 行 — 四角色概括修正为"系统管理员/QA审计员/报告审核员/普通操作员"(去 viewer)
- [ ] T22 `CLAUDE.md` 业务流程章节 — 四角色分工描述同步(去 viewer,加 reviewer;admin 职能改为配置/用户/存储/日志导出)

### 阶段 8:验证

- [ ] T23 `npm run build` 通过,产物无 viewer/、无越权页
- [ ] T24 全仓扫描 `viewer` 残留引用(应仅在历史 specs/plans 归档中出现)
- [ ] T25 各角色 login → dashboard → 侧栏菜单全链路跳转可达,sessionStorage 鉴权不丢
- [ ] T26 调用 `prototype-syntax-reviewer` 审核新建 5 页 HTML 语法 + JS 逻辑
- [ ] T27 调用 `prototype-code-reviewer` 复核新建页项目约束(antd 视觉/自包含/鉴权流/跳转路径/输入校验)
- [ ] T28 浏览器手测四角色全链路后 commit

## 风险与回滚

- **风险 1**:reviewer/approval.html 的 ESig 四意图实现复杂(二次凭证 + 留痕),需参照原 admin/approval.html 的逻辑(已删前先备份其内容供参考)。
  - **缓解**:T4 删除前先 `cp prototype/admin/approval.html /tmp/admin-approval-ref.html` 留参考,T7 新建 reviewer/approval.html 时迁移 ESig 逻辑。
- **风险 2**:admin 删 approval/audit-log/hash-chain 后,其他页面若有 `location.href='approval.html'` 等侧栏硬编码跳转,会死链。
  - **缓解**:T15 重排 admin dashboard 侧栏时同步移除这些菜单项;grep 全仓确认无残留跳转。
- **风险 3**:auditor 的 storage/report-export 是从 admin 复制后改只读,可能遗漏隐藏按钮。
  - **缓解**:T10/T11 完成后浏览器手测确认无编辑/备份/日志型导出入口。
- **回滚**:本计划改动量大但每阶段独立,按阶段 commit,任一阶段失败可 `git revert` 该 commit。T1-T4 删除前先建分支或确认 git 历史可恢复。

## 改动半径说明

本计划涉及 ~30 文件(删 18 + 新建 5 + 复制改 2 + 改 ~10),远超最小改动阈值(≤3 文件/≤50 行)。因属于角色模型对齐冻结需求的结构性调整,无法局部修补,必须整批执行。按 `.claude/rules/working-rules.md` §7,已先产出本方案文档待用户确认。

## Out of Scope

- 不改需求文档(已冻结,本次是原型对齐需求)
- 不改 sessionStorage 鉴权机制本身(仅新增 reviewer 角色的 key)
- 不引入真实后端/数据校验
- 不统一历史 specs/plans 归档中的 viewer 措辞(归档不删)
