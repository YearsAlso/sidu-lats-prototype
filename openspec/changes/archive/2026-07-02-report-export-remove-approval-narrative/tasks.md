# 实施任务清单

> 移除 admin/auditor 报告导出页的"导出需审批"叙事。单阶段,独立 commit。

## 1. 修改两个导出页(单阶段)

- [x] 1.1 `prototype/admin/report-export.html` — 替换"报告导出需审批"warning 卡(L197-199)为"导出合规约束"卡(文案对齐 M6-004/005/006 + Part 11 §11.10(k),warning 配色保持)
- [x] 1.2 `prototype/admin/report-export.html` — 删除"待审批导出申请"块(L201-208,`APR-20260701-006` 审批中)
- [x] 1.3 `prototype/auditor/report-export.html` — 同 1.1(文案与 admin 完全一致)
- [x] 1.4 `prototype/auditor/report-export.html` — 同 1.2
- [x] 1.5 验收:两页搜索"审批/审批中心/APR-20260701"无残留;warning 配色保持;JS/表格/Modal/侧栏/tab 未变
- [x] 1.6 浏览器双击打开两页无控制台报错,导出按钮仍触发 alert
- [x] 1.7 commit
