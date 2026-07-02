---
description: 一键全量审核——对工作区所有改动的 HTML 文件运行 prototype-code-reviewer（项目约束+antd 视觉）与 prototype-syntax-reviewer（HTML 语法+JS 逻辑），列出所有违规。
---

请按以下步骤执行审核：

## 1. 找出改动目标

用 `git diff --name-only HEAD` 找出本次改动的所有 `.html` 文件。若仅为审核全部页面，用 `find prototype/ -name '*.html' && echo 'index.html'` 列出全量 34 页。

## 2. 运行 prototype-code-reviewer

对每个改动的 HTML 文件调用 `prototype-code-reviewer` agent，复核以下维度：
- antd 5 视觉合规（主色 #1677ff、无旧色、无 emoji、无紫青渐变）
- 双击可跑自包含（无外部 CSS/JS）
- sessionStorage 鉴权流（lats_logged_in / lats_user）
- 跳转路径一致性（菜单指向文件存在）
- DOM/JS/数据完整性

每个文件只报告真实违规。

## 3. 运行 prototype-syntax-reviewer

对每个改动的 HTML 文件调用 `prototype-syntax-reviewer` agent，审核以下维度：
- HTML 语法（标签闭合、属性引号、合并冲突残留）
- 内联 JS 语法（括号、模板字符串、注释）
- JS 逻辑与 DOM 绑定（未定义变量、事件绑定、id 引用）
- 数据-渲染一致性

每个文件只报告真实错误。

## 4. 汇总报告

将两个 reviewer 的发现合并为统一报告：
```
## Review-All 审核报告

### prototype-code-reviewer（项目约束）
- ...

### prototype-syntax-reviewer（语法/逻辑）
- ...

### 结论
需修复 N 项 / 全部通过
```

不要在审核过程中自己改代码——只报告，让用户决定是否修。
