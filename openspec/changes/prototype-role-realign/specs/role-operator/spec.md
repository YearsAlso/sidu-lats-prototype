## ADDED Requirements

### Requirement: 操作员页面集收窄(角色图)
系统 SHALL 将 `prototype/operator/` 页面集收窄为 login + dashboard + data-entry(详见 `operator-data-entry` capability)。MUST 删除 operator 的 audit-log/approval/report-export。

#### Scenario: operator 侧栏
- **WHEN** 进入 `prototype/operator/dashboard.html`
- **THEN** 侧栏为"仪表盘"+"数据录入"两项,不含审计日志/审批中心/报告导出

### Requirement: 操作员切换角色卡片
`prototype/operator/login.html` 的切换角色卡片 SHALL 仅含 admin / auditor / reviewer,MUST 不含 viewer。

#### Scenario: operator login 切换卡片
- **WHEN** 进入 `prototype/operator/login.html`
- **THEN** 切换角色卡片为"切换:管理员/审计员/审核员"三项,无 viewer
