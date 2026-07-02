## ADDED Requirements

### Requirement: Reviewer 角色入口与鉴权
系统 SHALL 提供 `prototype/reviewer/login.html` 作为报告审核员(REVIEWER)的独立入口。登录时 SHALL 写入 sessionStorage:`lats_logged_in='true'`、`lats_user=<用户名>`、`lats_role='reviewer'`、`lats_role_name='报告审核员'`,并跳转到同目录 `dashboard.html`。密码校验保持原型 mock 规则(任意 ≥4 位)。

#### Scenario: 审核员登录成功
- **WHEN** 用户在 `prototype/reviewer/login.html` 输入任意用户名 + ≥4 位密码并提交
- **THEN** sessionStorage 写入 `lats_role='reviewer'` 与 `lats_role_name='报告审核员'`,页面跳转到 `prototype/reviewer/dashboard.html`

#### Scenario: 切换到其他角色
- **WHEN** 审核员在 login 页点击"切换:管理员/操作员/审计员"卡片
- **THEN** 跳转到 `prototype/admin/login.html` / `prototype/operator/login.html` / `prototype/auditor/login.html` 之一
- **AND** 切换卡片中不含 viewer 角色

### Requirement: Reviewer 仪表盘
系统 SHALL 提供 `prototype/reviewer/dashboard.html`,侧栏菜单仅含 2 项:仪表盘(active)+ 审批中心(`approval.html`)。仪表盘 SHALL 展示待复核报告队列统计(待复核数/已批准数/已驳回数)。

#### Scenario: 审核员进入仪表盘
- **WHEN** 审核员登录后跳转到 dashboard
- **THEN** 侧栏显示"仪表盘"+"审批中心"两项,无系统配置/用户管理等其他角色菜单
- **AND** 页面展示待复核报告的统计指标

### Requirement: 报告复核与电子签名 ESig 四意图
系统 SHALL 提供 `prototype/reviewer/approval.html`,实现 FDA 21 CFR Part 11 §11.50 电子签名声明,四种签署意图 MUST 分离:PREVIEW(预览)/ REVIEW(审核)/ APPROVE(批准)/ REJECT(驳回)。每次签署 SHALL 要求二次输入凭证(用户名+密码),且凭证需与登录用户一致(演示"双人知情/二次凭证"意图)。签署结果 SHALL 留痕(时间戳+意图+用户)。

#### Scenario: 批准报告
- **WHEN** 审核员选择一份待复核报告,点击"批准"并输入二次凭证(用户名+密码)
- **THEN** 系统校验凭证非空且用户名与 `lats_user` 一致,通过后记录"APPROVE"签署意图+时间戳+用户,报告状态变为"已批准"
- **AND** 页面即时反馈成功(message)

#### Scenario: 驳回报告并要求修改
- **WHEN** 审核员点击"驳回",输入二次凭证并填写驳回意见(maxlength 限制)
- **THEN** 系统记录"REJECT"意图+时间戳+用户+驳回意见,报告状态变为"已驳回-待修改"

#### Scenario: 二次凭证校验失败
- **WHEN** 审核员输入的二次凭证用户名与登录用户不一致,或密码为空
- **THEN** 系统显示可见错误反馈(message.error),不记录签署,不允许静默放行

#### Scenario: 预览与审核意图分离
- **WHEN** 审核员点击"预览"或"审核"
- **THEN** 这两个动作不产生签署记录(非签署意图),仅打开报告内容或标记已查看
