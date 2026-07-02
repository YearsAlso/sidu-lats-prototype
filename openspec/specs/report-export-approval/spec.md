# report-export-approval Specification

## Purpose
TBD - created by archiving change report-export-remove-approval-narrative. Update Purpose after archive.
## Requirements
### Requirement: admin 报告导出页不得包含导出审批叙事

`prototype/admin/report-export.html` SHALL NOT 包含"导出需审批""审批中心""待审批导出申请"叙事,且预览 Modal 演示数据中的角色构成 SHALL 对齐四角色模型(SYS_ADMIN/QA_AUDITOR/REVIEWER/OPERATOR),MUST NOT 出现已删除的 viewer/"查看者"角色表述。

#### Scenario: admin 导出页预览数据无 viewer 残留
- **WHEN** 进入 `prototype/admin/report-export.html` 并打开预览 Modal
- **THEN** "涉及用户"字段的角色构成为"管理员2 / 审计员2 / 操作员3 / 审核员1"(8 人),不含"查看者"

#### Scenario: admin 导出页导出审批叙事仍无残留
- **WHEN** 进入 `prototype/admin/report-export.html`
- **THEN** 不存在"报告导出需审批"提示卡与"待审批导出申请"块(沿用上一 change 约束)

### Requirement: auditor 报告导出页不得包含导出审批叙事

`prototype/auditor/report-export.html` SHALL NOT 包含"导出需审批""审批中心""待审批导出申请"叙事,且预览 Modal 演示数据中的角色构成 SHALL 对齐四角色模型,MUST NOT 出现"查看者"角色表述,文案与 admin 页完全一致。

#### Scenario: auditor 导出页预览数据无 viewer 残留
- **WHEN** 进入 `prototype/auditor/report-export.html` 并打开预览 Modal
- **THEN** "涉及用户"字段的角色构成为"管理员2 / 审计员2 / 操作员3 / 审核员1"(8 人),不含"查看者",与 admin 页一致

