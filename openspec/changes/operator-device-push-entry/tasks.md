## Task 1: 新增 CSS 样式 ✅

- **文件**: `prototype/operator/data-entry.html`
- **操作**: 在现有 `<style>` 块末尾追加推送预览面板 + 表格选中行样式(约 30 行 CSS)
- **验收**: 样式定义完整, 不覆盖现有类名

## Task 2: 新增设备推送数据卡片 DOM ✅

- **文件**: `prototype/operator/data-entry.html`
- **操作**: 在「NTA 原始数据上传」卡片 `<div class="card">` **之前**插入推送数据卡片 DOM(表格 + 预览面板骨架), 约 50 行 HTML
- **验收**: 页面渲染出新卡片, 表格有表头, 预览面板默认隐藏

## Task 3: 新增 JS 逻辑 ✅

- **文件**: `prototype/operator/data-entry.html`
- **操作**: 在现有 `<script>` 块中追加(不覆盖现有函数):
  - `pushData` mock 数组
  - `renderPushTable()` 渲染推送列表
  - `selectPush(idx)` 行选中 + 预览面板切换
  - `confirmPushEntry()` 确认录入校验 + 状态变更 + 最近录入表追加
  - `closePreview()` 关闭预览
- **验收**: 8 条验收标准全部通过

## Task 4: 浏览器手测

- **操作**: 打开 `prototype/operator/data-entry.html`(或通过 `prototype/index.html` → operator 入口 → 数据录入)
- **验证点**: 推送列表渲染、待录入行点击预览+补充录入、确认录入校验/成功、已录入行只读预览、关闭预览、现有手动录入不受影响
