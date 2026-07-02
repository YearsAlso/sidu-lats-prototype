## ADDED Requirements

### Requirement: 系统管理员页面集收窄
系统 SHALL 将 `prototype/admin/` 目录页面集收窄为:login.html + dashboard.html + user-management.html + system-settings.html + token-management.html + storage.html + report-export.html + notifications.html。MUST 删除 admin 现有的 `approval.html` / `audit-log.html` / `hash-chain.html`。

#### Scenario: admin 目录无越权页
- **WHEN** 列出 `prototype/admin/` 目录文件
- **THEN** 不含 approval.html / audit-log.html / hash-chain.html
- **AND** 含 user-management / system-settings / token-management / storage / report-export / notifications

### Requirement: 系统管理员禁止数据修改与报告签名
admin 页面集 MUST 不含任何数据修改入口(检测报告编辑、数据录入)与报告签名入口(电子签名 ESig 四意图)。admin 的 report-export 仅用于日志备份导出,不含合规报告签名。

#### Scenario: admin 无电子签名入口
- **WHEN** 浏览 admin 下所有页面
- **THEN** 不含 PREVIEW/REVIEW/APPROVE/REJECT 签署意图按钮,无二次凭证签署表单

#### Scenario: admin 侧栏无审批/审计/哈希
- **WHEN** 进入 `prototype/admin/dashboard.html`
- **THEN** 侧栏菜单为:仪表盘/用户管理/Token管理/系统设置/存储管理/报告导出/通知中心 + 退出
- **AND** 不含"审批中心""审计日志""哈希链"菜单项

### Requirement: admin 切换角色卡片
`prototype/admin/login.html` 的切换角色卡片 SHALL 仅含 auditor / operator / reviewer 三角色,MUST 不含 viewer。

#### Scenario: admin login 切换卡片
- **WHEN** 进入 `prototype/admin/login.html`
- **THEN** 切换角色卡片为"切换:操作员/审计员/审核员"三项,无 viewer
