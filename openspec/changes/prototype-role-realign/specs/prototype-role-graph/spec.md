## ADDED Requirements

### Requirement: 删除 viewer 角色
系统 MUST 删除 `prototype/viewer/` 整目录(11 页)。viewer 角色无需求依据(需求文档 §1.4/§6.1/§6.2 全文无 Viewer/查看者/只读角色)。删除后全仓 MUST 无指向 `prototype/viewer/` 的活引用(历史 `docs/superpowers/` 归档除外)。

#### Scenario: viewer 目录不存在
- **WHEN** 列出 `prototype/` 子目录
- **THEN** 仅含 admin / operator / auditor / reviewer,不含 viewer

#### Scenario: 无 viewer 跳转残留
- **WHEN** 在 `prototype/`、`vite.config.js`、`src/viewer/prototype-pages.js`、`CLAUDE.md`、`README.md`、`docs/Index.md` 中搜索 `viewer`
- **THEN** 现行文件无指向 `prototype/viewer/` 的路径引用(历史 specs/plans 归档允许保留)

### Requirement: 角色目录结构对齐权限矩阵
`prototype/` 下四个角色子目录的页面集 SHALL 严格对齐需求文档 §6.2 权限矩阵:admin(配置/用户/存储/日志导出)、auditor(审计/哈希/介质抽检/合规导出/权限复审)、reviewer(报告复核/电子签名)、operator(数据录入)。

#### Scenario: 四角色目录
- **WHEN** 列出 `prototype/` 子目录
- **THEN** 恰好四个:admin / auditor / reviewer / operator

### Requirement: 构建配置同步
`vite.config.js` 的 rollupOptions.input 与 `src/viewer/prototype-pages.js` 的导航分组 SHALL 同步反映角色目录变更(移除 viewer 与越权页入口,新增 reviewer / data-entry / permission-review 入口)。`npm run build` MUST 成功且 `dist/` 无 viewer/ 残留。

#### Scenario: 构建成功
- **WHEN** 执行 `npm run build`
- **THEN** 构建成功,`dist/` 含 admin/auditor/reviewer/operator 四角色子目录,无 viewer/

### Requirement: 文档同步
`docs/Index.md` 第 25 行四角色概括 SHALL 修正为"系统管理员/QA审计员/报告审核员/普通操作员"。`CLAUDE.md` 业务流程章节 SHALL 同步四角色分工(去 viewer、加 reviewer、admin 职能改为配置/用户/存储/日志导出)。

#### Scenario: Index.md 角色概括修正
- **WHEN** 读取 `docs/Index.md` 第 25 行
- **THEN** 角色列表为"系统管理员/QA审计员/报告审核员/普通操作员",不含"查看者",含"报告审核员"
