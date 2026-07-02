# report-export-approval Specification

## Purpose
TBD - created by archiving change report-export-remove-approval-narrative. Update Purpose after archive.
## Requirements
### Requirement: admin 报告导出页不得包含导出审批叙事

`prototype/admin/report-export.html` SHALL NOT 包含"导出需审批""审批中心""待审批导出申请"叙事。MUST 将原"报告导出需审批"提示卡替换为"导出合规约束"提示卡,文案对齐 PRD §4.7 M6-004(防篡改哈希)/ M6-005(角色权限)/ M6-006(审计留痕不可删)与 FDA 21 CFR Part 11 §11.10(k)(电子记录精确复制)。MUST 删除"待审批导出申请"块(`APR-20260701-006` 审批中单据)。

#### Scenario: admin 导出页无导出审批叙事残留
- **WHEN** 进入 `prototype/admin/report-export.html`
- **THEN** 不存在"报告导出需审批"提示卡与"待审批导出申请"块(`APR-20260701-006` 作为导出审批单据);预览 Modal 内审计日志/合规摘要中引用"审批中心"(reviewer 报告复核模块)的演示数据属合法系统模块引用,不视为导出审批叙事

#### Scenario: admin 导出页提示卡对齐 M6 合规约束
- **WHEN** 查看导出页提示卡
- **THEN** 卡片标题语义为"导出合规约束"(非"需审批"),文案包含哈希防篡改(M6-004)、角色权限(M6-005)、审计留痕不可删(M6-006)、Part 11 精确复制四项中至少三项

#### Scenario: admin 导出页提示卡保持 warning 配色
- **WHEN** 查看提示卡样式
- **THEN** 底色 `#fffbe6`、描边 `#ffe58f`、标题字色 `#d48806`(antd warning token)

#### Scenario: admin 导出页 JS 逻辑不受影响
- **WHEN** 点击导出/下载/验证按钮
- **THEN** 仍触发原有 `generateReport`/`downloadReport`/`verifyReport`/`downloadSample` 函数(直接 alert,无审批前置)

#### Scenario: admin 导出页相邻快捷卡保留
- **WHEN** 查看提示卡上方区域
- **THEN** "合规证明"快捷卡(purple 底 `#f9f0ff`)保持原样未受影响

### Requirement: auditor 报告导出页不得包含导出审批叙事

`prototype/auditor/report-export.html` SHALL NOT 包含"导出需审批""审批中心""待审批导出申请"叙事。MUST 将原"报告导出需审批"提示卡替换为"导出合规约束"提示卡,文案与 admin 页完全一致,对齐 PRD §4.7 M6-004/005/006 与 Part 11 §11.10(k)。MUST 删除"待审批导出申请"块。

#### Scenario: auditor 导出页无导出审批叙事残留
- **WHEN** 进入 `prototype/auditor/report-export.html`
- **THEN** 不存在"报告导出需审批"提示卡与"待审批导出申请"块;预览 Modal 内引用"审批中心"的演示数据属合法系统模块引用,不视为导出审批叙事

#### Scenario: auditor 导出页提示卡与 admin 一致
- **WHEN** 对比 admin 与 auditor 两页提示卡
- **THEN** 标题、文案、配色完全一致

#### Scenario: auditor 导出页 JS 逻辑不受影响
- **WHEN** 点击导出/下载/验证按钮
- **THEN** 仍触发原有函数(直接 alert,无审批前置)

