## ADDED Requirements

### Requirement: 权限复审只读视图
系统 SHALL 提供 `prototype/auditor/permission-review.html`,以只读表格列出用户清单(用户名/角色/权限范围/最后复审日期)。页面 MUST 支持按角色筛选。MUST 无新增/编辑/删除用户按钮(权限管理归 SYS_ADMIN)。

#### Scenario: 查看用户权限清单
- **WHEN** 审计员进入 permission-review 页
- **THEN** 表格展示用户清单(用户名、角色、权限范围、最后复审日期),无编辑入口
- **AND** 表头为 `#fafafa`,行 hover 为 `#fafafa`,行线 `#f0f0f0`(antd Table 视觉)

#### Scenario: 按角色筛选
- **WHEN** 审计员在筛选栏选择角色(如"全部/管理员/审核员/操作员/审计员")
- **THEN** 表格仅显示该角色的用户
- **AND** 筛选栏为 antd Form + Select 视觉

#### Scenario: 无编辑入口
- **WHEN** 审计员浏览 permission-review 页
- **THEN** 页面不含"新增用户""编辑""删除""分配权限"等按钮
- **AND** 仅有"导出"只读查看类操作(若有)
