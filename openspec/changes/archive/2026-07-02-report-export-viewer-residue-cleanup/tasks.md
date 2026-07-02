# 实施任务清单

> 清理导出页演示数据中的 viewer/"查看者"角色残留。单阶段,独立 commit。

## 1. 替换 4 处演示数据(单阶段)

- [x] 1.1 `prototype/admin/report-export.html` L253 — "查看者1" → "审核员1"(预览 Modal 文本块)
- [x] 1.2 `prototype/admin/report-export.html` L478 — "查看者1" → "审核员1"(预览 Modal 表格行)
- [x] 1.3 `prototype/auditor/report-export.html` L247 — 同 1.1
- [x] 1.4 `prototype/auditor/report-export.html` L472 — 同 1.2
- [x] 1.5 验收:两页搜索"查看者"无残留;8 人总数不变;JS/表格/Modal/侧栏未变
- [x] 1.6 浏览器双击打开两页无控制台报错
- [x] 1.7 commit
