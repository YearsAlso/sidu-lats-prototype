# Proposal: 清理导出页演示数据中的 viewer 角色残留

## Why

角色对齐 change(`prototype-role-realign`)删除了 viewer 角色并对齐四角色模型(SYS_ADMIN/QA_AUDITOR/REVIEWER/OPERATOR)。但两个报告导出页预览 Modal 的演示数据中仍残留"查看者1"角色表述:

- `prototype/admin/report-export.html` L253、L478:"8 人(管理员2 / 审计员2 / 操作员3 / 查看者1)"
- `prototype/auditor/report-export.html` L247、L472:同上

"查看者"对应已删除的 viewer 角色,PRD V3.0 §6.1/§6.2 四角色中无此角色。该残留与冻结需求及现行四角色模型矛盾,审计方对照权限矩阵会发现"系统里有一个需求未定义的角色",削弱合规演示可信度。需清理对齐为"审核员"(REVIEWER)。

## What Changes

- 将 4 处演示数据中的"查看者1"替换为"审核员1",8 人总数不变(管理员2 / 审计员2 / 操作员3 / 审核员1 = 8)
- **不改**:其他演示数据(时间戳/哈希/单据号/IP)、JS 逻辑、表格结构、预览 Modal 结构、侧栏、鉴权流
- **不改**:需求文档(已冻结)

## Capabilities

### Modified Capabilities
- `report-export-approval`: 导出页预览 Modal 演示数据的角色构成对齐四角色模型,移除 viewer 残留

(无 New Capabilities)

## Impact

- **代码**:2 文件 4 处,每处 1 词替换,合计 ≤4 行
- **构建配置**:无改动
- **文档**:无改动
- **风险**:极低,纯演示数据文案替换,单 commit 可回滚;需确保两页一致、4 处全改
- **需求文档**:不改(已冻结)

## 验收标准

1. 两个导出页全文搜索"查看者"无残留
2. "审核员1"替换后 8 人总数不变(2+2+3+1=8)
3. 两页演示数据一致
4. JS/表格/Modal/侧栏/鉴权流未受影响
5. 双击打开无控制台报错
