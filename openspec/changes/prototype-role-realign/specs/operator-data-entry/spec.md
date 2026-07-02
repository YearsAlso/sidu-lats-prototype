## ADDED Requirements

### Requirement: 操作员数据录入入口
系统 SHALL 提供 `prototype/operator/data-entry.html` 作为普通操作员(OPERATOR)的核心职能页,实现 NTA(纳米颗粒跟踪分析)原始数据上传 + 基础数据录入。页面 MUST 无审批、无导出、无签名入口(§6.2 OPERATOR 权限边界)。

#### Scenario: 上传 NTA 原始数据
- **WHEN** 操作员在 data-entry 页选择文件(文件选择按钮或拖拽区)并填写批次信息
- **THEN** 页面显示已选文件名(mock,不真实上传),允许"提交"
- **AND** 提交后显示成功反馈(message),写审计留痕(mock,记录上传动作)

#### Scenario: 基础数据录入
- **WHEN** 操作员填写基础数据表单(批次号/样本编号/检测项等必填字段)
- **THEN** 必填字段为空时提交显示校验错误,不允许静默放行
- **AND** 提交成功后反馈并留痕

#### Scenario: 无越权入口
- **WHEN** 操作员进入 data-entry 页
- **THEN** 页面不含审批、报告导出、电子签名、用户管理等按钮或菜单
- **AND** 侧栏仅"仪表盘"+"数据录入"两项

### Requirement: 操作员页面集收窄
系统 SHALL 将 `prototype/operator/` 目录页面集收窄为:login.html + dashboard.html + data-entry.html。MUST 删除 operator 现有的 `audit-log.html` / `approval.html` / `report-export.html`(无审计/审批/导出权限)。

#### Scenario: 操作员目录无越权页
- **WHEN** 列出 `prototype/operator/` 目录文件
- **THEN** 仅含 login.html / dashboard.html / data-entry.html,不含 audit-log/approval/report-export
