## Why

需求文档 V3.0(冻结)§1.4/§6.1/§6.2 定义四角色三权分立:`SYS_ADMIN / QA_AUDITOR / REVIEWER / OPERATOR`,§6.3 明确"四角色硬隔离、禁止一人兼任多岗"。当前原型实现为 `admin/operator/auditor/viewer`,存在三处偏离:

1. `viewer` 角色需求文档全文未定义(原型多加,疑似受 `docs/Index.md` 错误概括影响)
2. `REVIEWER`(报告审核员)角色缺失 —— 这是 Phase 2 从三角色升级为四角色时新增的核心角色,承担 FDA 21 CFR Part 11 §11.50 电子签名声明职能
3. 各角色页面归属与 §6.2 权限矩阵不符:admin 越权做了审批/哈希校验,operator 越权做了审计/审批/导出,auditor 越权做了审批,且 admin 未禁止数据修改

原型作为合规演示载体,角色模型与冻结需求不一致会直接削弱 Part 11 三权分立的演示价值,必须对齐。

## What Changes

- **BREAKING** 删除 `prototype/viewer/` 整目录(11 页)—— 无需求依据
- **BREAKING** 删除 admin 越权页:`approval.html` / `audit-log.html` / `hash-chain.html` —— admin 禁止报告签名、数据修改、哈希校验(归 auditor)
- **BREAKING** 删除 operator 越权页:`audit-log.html` / `approval.html` / `report-export.html` —— operator 无审计/审批/导出/签名权限
- **BREAKING** 删除 auditor 越权页:`approval.html` —— 审核权归 reviewer
- 新建 `prototype/reviewer/`(3 页):`login.html` + `dashboard.html` + `approval.html`(报告复核 + 电子签名 ESig 四意图 PREVIEW/REVIEW/APPROVE/REJECT + 驳回修改 + 二次凭证 + 留痕)
- 新建 `prototype/operator/data-entry.html` —— NTA 原始数据上传 + 基础数据录入(operator 核心职能,原型原缺)
- 新建 `prototype/auditor/permission-review.html` —— 权限复审只读视图(用户清单/角色/权限范围/最后复审日期,无编辑)
- 复制 `admin/storage.html` → `auditor/storage.html` 改只读(隐藏备份/配置,保留介质抽检视图)
- 复制 `admin/report-export.html` → `auditor/report-export.html` 只留合规型(隐藏日志型导出)
- 各角色 `login.html` 切换角色卡片:去 viewer、加 reviewer
- 各角色 `dashboard.html` 侧栏菜单按权限矩阵重排
- `vite.config.js` + `src/viewer/prototype-pages.js` 同步入口
- `docs/Index.md` 第 25 行四角色概括修正
- `CLAUDE.md` 业务流程章节同步

## Capabilities

### New Capabilities
- `role-reviewer`: 报告审核员(REVIEWER)角色 —— 报告复核、电子签名 ESig 四意图、驳回修改流程;三级权限,禁止账号管理与系统底层配置
- `operator-data-entry`: 操作员数据录入 —— NTA 原始数据上传 + 基础数据录入 + 自有数据查询;四级权限,无审批/导出/签名
- `auditor-permission-review`: QA 审计员权限复审 —— 只读列出用户清单与角色权限范围,支持按角色筛选,无编辑

### Modified Capabilities
- `role-admin`: 系统管理员页面集收窄 —— 移除审批/审计日志/哈希链页面,回归纯配置/用户/存储/日志导出;明确禁止数据修改与报告签名
- `role-auditor`: QA 审计员页面集调整 —— 移除审批页,新增只读存储页(介质抽检)、合规型报告导出、权限复审页
- `role-operator`: 操作员页面集收窄 —— 移除审计/审批/导出页,新增数据录入页
- `prototype-role-graph`: 角色目录结构 —— 删除 viewer 角色,新增 reviewer 角色,各角色页面归属按 §6.2 矩阵重排

## Impact

- **代码**:`prototype/` 下 ~30 文件(删 18 + 新建 5 + 复制改 2 + 改 ~10)
- **构建配置**:`vite.config.js`(input 入口增减)、`src/viewer/prototype-pages.js`(分组导航)
- **文档**:`docs/Index.md`、`CLAUDE.md`、`docs/superpowers/plans/2026-07-02-prototype-role-realign.md`(已有,作为本 change 的实施依据)
- **鉴权流**:sessionStorage 新增 `lats_role='reviewer'` / `lats_role_name='报告审核员'`;机制本身不变
- **依赖**:无新增依赖(纯静态原型,reviewer/approval.html 的 ESig 逻辑迁移自原 admin/approval.html)
- **风险**:admin/approval.html 删除前需备份 ESig 逻辑供 reviewer 迁移;侧栏硬编码跳转需全文同步防死链;auditor 复制页需彻底隐藏编辑入口
- **需求文档**:不改(已冻结;本次是原型对齐需求,非需求变更)
