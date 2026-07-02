## Context

SIDU-LATS 是 FDA 21 CFR Part 11 合规版的缺陷识别数据存管系统**交互原型**(纯静态 HTML,双击可跑,无后端)。原型用 sessionStorage mock 鉴权(`lats_logged_in` / `lats_user` / `lats_role` / `lats_role_name`),四角色通过各自子目录 `prototype/<role>/` 隔离页面。

需求文档 V3.0(冻结)§6.2 权限矩阵定义四角色三权分立,但当前原型角色模型偏离:多加了 `viewer`、缺失 `REVIEWER`、各角色页面越权。本设计说明如何对齐而不破坏"双击可跑""自包含""sessionStorage 鉴权流"等核心约束。

**当前状态**:
- `prototype/admin/`(11 页):含 approval/audit-log/hash-chain(越权)
- `prototype/operator/`(5 页):含 audit-log/approval/report-export(越权)
- `prototype/auditor/`(6 页):含 approval(越权)
- `prototype/viewer/`(11 页):无需求依据
- 无 reviewer 角色

**约束**:
- 每个 HTML 自包含(内联 `<style>` + `<script>`),不抽公共 CSS/JS
- 不引入 antd JS 库 / 框架 / 外部 CDN
- 不改 sessionStorage 机制本身(仅新增 reviewer 的 key)
- 不改真实业务数据(哈希值/时间戳/审计记录)
- 视觉严格遵循 antd 5 token(见 `.claude/agents/prototype-ui-reviewer.md`)

## Goals / Non-Goals

**Goals:**
- 原型四角色对齐需求 §6.2:`admin/operator/auditor/reviewer`
- 每个角色子目录只含其有权访问的页面,越权页删除
- reviewer 角色承载 ESig 电子签名四意图(PREVIEW/REVIEW/APPROVE/REJECT)+ 驳回 + 二次凭证 + 留痕
- operator 补齐数据录入核心职能
- auditor 补齐权限复审 + 介质抽检(只读)+ 合规导出
- admin 明确禁止数据修改/报告签名,回归配置/用户/存储/日志导出
- 双击可跑、自包含、鉴权流不破坏

**Non-Goals:**
- 不改需求文档(冻结,本次是原型对齐需求)
- 不实现真实后端/数据库/WORM 存储(原型只演示交互意图)
- 不引入真实鉴权或 token 校验
- 不统一历史 `docs/superpowers/` 归档中的 viewer 措辞(归档不删)
- 不抽公共 CSS/JS(即便 reviewer/approval 与原 admin/approval 逻辑相似,也各自内联)
- 不做 viewer↔iframe postMessage 通信

## Decisions

### D1: reviewer/approval.html 的 ESig 逻辑从原 admin/approval.html 迁移,而非重写
- **选择**:T4 删除 admin/approval.html 前,先 `cp` 到 `/tmp/admin-approval-ref.html` 作参考,T7 新建 reviewer/approval.html 时迁移 ESig 四意图 + 二次凭证 + 留痕逻辑
- **理由**:原 admin/approval.html 已实现 ESig 四意图,重写浪费且易引入 bug;迁移保留已验证的交互逻辑
- **备选**:从零重写 —— 否决,违反最小改动原则且风险高
- **权衡**:迁移后需调整文案为"报告复核"语境(原为"审批中心"),并确保 sessionStorage 写入 `lats_role='reviewer'`

### D2: auditor 的 storage/report-export 采用"复制 admin 版 + 改只读",而非新建独立页
- **选择**:T10/T11 复制 admin 版,隐藏编辑/备份/日志型导出按钮,保留只读视图
- **理由**:auditor 的介质抽检/合规导出与 admin 的存储/导出在视觉结构上高度重合,复制改只读比新建独立页快且视觉一致
- **备选**:新建 auditor 专用 storage/export 页 —— 否决,工作量大且产生视觉分歧
- **权衡**:复制后必须彻底隐藏编辑入口(备份按钮、配置按钮、日志型导出 tab),需浏览器手测确认

### D3: operator/data-entry.html 新建,NTA 上传用 mock 文件选择(不真实上传)
- **选择**:文件选择按钮 + 拖拽区 + 基础录入表单(批次/样本/检测项),提交后 `message` 反馈成功 + 写审计留痕(mock)
- **理由**:原型不实现真实上传,只演示交互意图;NTA(纳米颗粒跟踪分析)原始数据上传是 operator 核心职能,不能缺
- **备选**:本次不补,operator 只剩 login+dashboard —— 否决,演示单薄且不符合 §6.2"数据录入"职能

### D4: auditor/permission-review.html 只读,无任何编辑入口
- **选择**:只读表格列出用户(用户名/角色/权限范围/最后复审日期),支持按角色筛选,无新增/编辑/删除按钮
- **理由**:§6.2 给 QA_AUDITOR 的是"权限复审"(审计职能),不是"权限管理"(管理职能归 admin);auditor 只看不改
- **备选**:给 auditor 编辑权限 —— 否决,违反三权分立(管理权归 SYS_ADMIN)

### D5: 各角色 login.html 的"切换角色"卡片统一为四角色(admin/operator/auditor/reviewer),去 viewer
- **选择**:四张卡片互相交叉链接,`onclick="location.href='../<role>/login.html'"`
- **理由**:演示便利,允许快速切换角色体验不同权限;viewer 移除后卡片减为 4 张
- **备选**:去掉切换卡片 —— 否决,降低演示体验

### D6: 不新建 admin 的"签名作废会签"页
- **选择**:admin 完全移除 approval,签名作废会签功能(§6.2 矩阵中 SYS_ADMIN+REVIEWER 双人审批)放在 reviewer/approval.html 内,admin 不参与
- **理由**:简化原型;矩阵中 admin 的"签名作废双人审批"在原型演示层面可由 reviewer 发起、admin 在系统侧确认,但为控制改动半径,本次不在 admin 侧建独立会签页
- **备选**:admin 保留精简 approval(只显示作废会签队列)—— 否决,实现复杂且 admin 侧栏更干净
- **权衡**:这是原型演示层面的简化,真实系统应实现双人会签;在 reviewer/approval.html 的留痕记录里体现"双人审批"意图即可

### D7: 分阶段 commit,每阶段独立可回滚
- **选择**:8 个阶段(plan 中 T1-T28)按阶段 commit,任一阶段失败 `git revert` 该 commit
- **理由**:改动 ~30 文件,整批失败难定位;分阶段符合 `.claude/rules/working-rules.md` §7"独立可回滚"

## Risks / Trade-offs

- **[风险 1] admin/approval.html 删除后 ESig 逻辑丢失** → T4 删除前先备份到 `/tmp/admin-approval-ref.html`,T7 迁移时对照
- **[风险 2] 侧栏硬编码跳转死链** → 各 dashboard 侧栏重排时同步移除菜单项;T24 全仓 grep `location.href='approval.html'` 等确认无残留指向已删文件
- **[风险 3] auditor 复制页遗漏隐藏编辑入口** → T10/T11 完成后浏览器手测,确认无备份/配置/日志型导出按钮
- **[风险 4] reviewer 角色未写 lats_role 导致鉴权异常** → T7 的 login.html 必须设 `lats_role='reviewer'`/`lats_role_name='报告审核员'`,T27 由 prototype-code-reviewer 复核
- **[风险 5] 改动 ~30 文件远超最小改动阈值** → 已先产出本 design + plan 文档获用户确认;分阶段 commit 控制风险
- **[权衡] reviewer/approval 迁移自 admin/approval** → 文案需从"审批中心"调整为"报告复核",但 ESig 四意图逻辑保留;接受少量文案差异
- **[权衡] auditor 用复制版 storage/export** → 与 admin 版视觉高度相似,但功能裁剪;接受相似性换取一致性

## Migration Plan

无生产迁移(纯静态原型)。部署方式:GitHub Pages 推 master。回滚:每阶段独立 commit,`git revert` 对应 commit 即可恢复。

执行顺序(与 plan 文档 T1-T28 对应):
1. 阶段 1(T1-T4):删除 18 页 —— commit
2. 阶段 2(T5-T7):新建 reviewer 3 页 —— commit
3. 阶段 3(T8):新建 operator/data-entry —— commit
4. 阶段 4(T9):新建 auditor/permission-review —— commit
5. 阶段 5(T10-T11):复制 auditor storage/report-export —— commit
6. 阶段 6(T12-T18):改各角色 login + dashboard 侧栏 —— commit
7. 阶段 7(T19-T22):构建配置 + 文档同步 —— commit
8. 阶段 8(T23-T28):验证(build + reviewer agents + 浏览器手测)—— 通过后最终 commit

## Open Questions

无。所有决策已与用户确认(Q1:A 数据录入页新建;Q2:B auditor 用只读 storage;Q3:A auditor 权限复审新建;四角色分立无超管;admin 禁止数据修改)。
