## ADDED Requirements

### Requirement: QA 审计员页面集调整
系统 SHALL 将 `prototype/auditor/` 目录页面集调整为:login.html + dashboard.html + audit-log.html + hash-chain.html + storage.html(只读) + report-export.html(合规型) + permission-review.html。MUST 删除 auditor 现有的 `approval.html`(审核权归 reviewer)。

#### Scenario: auditor 目录无审批页
- **WHEN** 列出 `prototype/auditor/` 目录文件
- **THEN** 不含 approval.html
- **AND** 含 storage.html / report-export.html / permission-review.html(新增)

### Requirement: auditor 存储页只读
`prototype/auditor/storage.html` SHALL 为只读视图,展示存储分布/存储健康/介质抽检信息。MUST 隐藏"备份""配置"等编辑入口(备份操作归 SYS_ADMIN)。

#### Scenario: auditor 存储页无编辑入口
- **WHEN** 审计员进入 `prototype/auditor/storage.html`
- **THEN** 页面展示存储分布、存储健康、介质抽检信息
- **AND** 不含"立即备份""修改配置"等按钮

### Requirement: auditor 报告导出仅合规型
`prototype/auditor/report-export.html` SHALL 仅提供"合规报告"类型导出,MUST 隐藏"日志型"导出(日志备份导出归 SYS_ADMIN)。

#### Scenario: auditor 导出合规报告
- **WHEN** 审计员进入 `prototype/auditor/report-export.html`
- **THEN** 报告类型选项仅含"合规报告",不含"日志型"
- **AND** 导出按钮可用

### Requirement: auditor 侧栏菜单
`prototype/auditor/dashboard.html` 侧栏 SHALL 为:仪表盘/审计日志/哈希链/存储管理/报告导出/权限复审 + 退出。MUST 不含"审批中心"。

#### Scenario: auditor 侧栏
- **WHEN** 进入 `prototype/auditor/dashboard.html`
- **THEN** 侧栏含审计日志/哈希链/存储管理/报告导出/权限复审,不含审批中心

### Requirement: auditor 切换角色卡片
`prototype/auditor/login.html` 的切换角色卡片 SHALL 仅含 admin / operator / reviewer,MUST 不含 viewer。

#### Scenario: auditor login 切换卡片
- **WHEN** 进入 `prototype/auditor/login.html`
- **THEN** 切换角色卡片为"切换:管理员/操作员/审核员"三项,无 viewer
