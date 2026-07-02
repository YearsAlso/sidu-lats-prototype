# Design: 清理导出页演示数据中的 viewer 角色残留

## 设计决策

### D1:仅替换"查看者"为"审核员",不动数字

残留是"查看者1"角色名。四角色中 REVIEWER(报告审核员)是 viewer 删除后的对位角色,且演示数据中 reviewer 王芳确实存在(见 `prototype/reviewer/approval.html`)。将"查看者1"→"审核员1",8 人总数(2+2+3+1)不变,最小改动。

### D2:不动其他演示数据

时间戳、哈希、单据号、IP、操作记录内容均属"真实数据"(CLAUDE.md 约束:不改真实数据),本次只改角色名,不碰其他字段。

### D3:两页 4 处全改且一致

admin 与 auditor 两页的演示数据当前完全一致,改动后须保持一致。4 处(每页 2 处:预览 Modal 文本块 + 表格行)全部替换。

### D4:沿用现有 report-export-approval capability

本 change 是上一个 change(`report-export-remove-approval-narrative`,已归档)同一 capability 的延续,使用 MODIFIED Requirements(目标 spec 已存在)。

## 不做

- 不改其他页面的演示数据(本次范围仅导出页 4 处残留)
- 不改 JS 逻辑、表格结构、Modal 结构
- 不改需求文档
