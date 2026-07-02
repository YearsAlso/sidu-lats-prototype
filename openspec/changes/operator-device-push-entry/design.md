## 1. 文件范围

仅修改 `prototype/operator/data-entry.html`(1 个文件)，增量约 150 行 CSS + DOM + JS。

## 2. DOM 结构设计

### 2.1 新增卡片:设备推送数据

在现有「NTA 原始数据上传」卡片**之前**插入新卡片:

```
<div class="card">
  <div class="card-title">设备推送数据 <span style="...">mock 模拟设备推送</span></div>
  <table id="pushTable">
    <thead><tr><th>推送编号</th><th>来源设备</th><th>推送时间</th><th>检测类型</th><th>样品数</th><th>数据摘要</th><th>状态</th></tr></thead>
    <tbody id="pushTbody">
      <!-- JS 动态渲染 3 条 mock 数据 -->
    </tbody>
  </table>
  <div id="pushPreview" class="push-preview" style="display:none;">
    <!-- 预览面板 -->
  </div>
</div>
```

### 2.2 预览面板结构(选中行后展示)

```
<div class="push-preview" id="pushPreview" style="display:none;">
  <div class="preview-header">
    <span class="preview-title">推送详情 — <span id="previewPushId">—</span></span>
    <span class="preview-close" onclick="closePreview()">✕</span>
  </div>
  <div class="preview-body">
    <!-- 只读详情区: 设备推送原始数据 -->
    <div class="preview-section">
      <div class="preview-label">数据摘要</div>
      <div class="preview-grid">
        <div><span>推送编号</span><span id="pvPushId">—</span></div>
        <div><span>来源设备</span><span id="pvDevice">—</span></div>
        <div><span>推送时间</span><span id="pvTime">—</span></div>
        <div><span>检测类型</span><span id="pvType">—</span></div>
        <div><span>样品数量</span><span id="pvCount">—</span></div>
        <div><span>文件名称</span><span class="hash-val" id="pvFile">—</span></div>
        <div><span>文件大小</span><span id="pvSize">—</span></div>
        <div><span>数据哈希</span><span class="hash-val" id="pvHash">—</span></div>
      </div>
    </div>
    <!-- 待录入: 补充录入表单 -->
    <div class="preview-section" id="entrySection" style="display:none;">
      <div class="preview-label">补充录入信息</div>
      <div class="form-grid">
        <div class="form-group"><label>批次编号<span class="req">*</span></label><input type="text" id="pushBatchId" required></div>
        <div class="form-group"><label>检测日期<span class="req">*</span></label><input type="date" id="pushDetectDate" required></div>
      </div>
      <div class="form-group"><label>备注</label><textarea id="pushRemarks" rows="2" maxlength="500"></textarea></div>
      <button class="btn-primary" onclick="confirmPushEntry()">确认录入</button>
    </div>
    <!-- 已录入: 只读录入摘要 -->
    <div class="preview-section" id="doneSection" style="display:none;">
      <div class="preview-label">录入摘要</div>
      <div class="preview-grid">
        <div><span>操作人</span><span id="pvOperator">—</span></div>
        <div><span>录入时间</span><span id="pvEntryTime">—</span></div>
        <div><span>批次编号</span><span id="pvBatch">—</span></div>
        <div><span>审计留痕</span><span class="hash-val" id="pvAuditHash">—</span></div>
      </div>
    </div>
  </div>
</div>
```

### 2.3 现有卡片保持不变

- NTA 原始数据上传卡片(保留)
- 基础数据录入卡片(保留)
- 我的最近录入卡片(保留, 推送录入后动态追加行)

## 3. CSS 新增

```css
/* 预览面板 */
.push-preview{border:1px solid #d9d9d9;border-radius:6px;margin-top:16px;overflow:hidden;}
.preview-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#fafafa;border-bottom:1px solid #f0f0f0;}
.preview-title{font-size:14px;font-weight:500;color:rgba(0,0,0,0.88);}
.preview-close{cursor:pointer;color:rgba(0,0,0,0.45);font-size:16px;line-height:1;}
.preview-close:hover{color:rgba(0,0,0,0.88);}
.preview-body{padding:16px;}
.preview-section{margin-bottom:16px;}
.preview-section:last-child{margin-bottom:0;}
.preview-label{font-size:13px;font-weight:500;color:rgba(0,0,0,0.65);margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #fafafa;}
.preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;}
.preview-grid div{display:flex;justify-content:space-between;align-items:center;font-size:13px;}
.preview-grid div span:first-child{color:rgba(0,0,0,0.45);flex-shrink:0;margin-right:8px;}
.preview-grid div span:last-child{color:rgba(0,0,0,0.88);text-align:right;word-break:break-all;}
/* 表格行选中 */
#pushTable tbody tr{cursor:pointer;transition:background 0.15s;}
#pushTable tbody tr.selected{background:#e6f4ff;}
#pushTable tbody tr.selected td{border-bottom-color:#e6f4ff;}
```

## 4. JS 逻辑设计

### 4.1 Mock 数据

```js
var pushData = [
  { id:'PUSH-001', device:'SIDU-NTA-001', time:'2026-07-02 14:20:33', type:'NTA 粒径分析', count:128, file:'nta-128.dat', size:'2.4 MB', hash:'a3f1b8c2...e7d9', status:'pending' },
  { id:'PUSH-002', device:'SIDU-DEF-001', time:'2026-07-02 15:10:07', type:'缺陷识别',     count:64,  file:'def-064.zip', size:'5.1 MB', hash:'c8d2e1a4...f3b6', status:'pending' },
  { id:'PUSH-003', device:'SIDU-NTA-001', time:'2026-07-01 09:00:15', type:'颗粒计数',     count:256, file:'cnt-256.csv', size:'0.8 MB', hash:'e7b3d9f2...a1c5', status:'done', operator:'李华', entryTime:'2026-07-01 09:15:42', batch:'BAT-20260701-C', auditHash:'3f8a...19c2' }
];
```

### 4.2 渲染推送列表

`renderPushTable()` — 遍历 pushData, 生成 `<tr>`。status==='done' 的行底色 #fafafa(已录入弱化)。

### 4.3 行选中交互

`selectPush(rowIndex)`:
- 所有行移除 `.selected`，当前行加 `.selected`
- 显示 `#pushPreview`
- 填入只读详情区字段
- 若 status==='pending': 显示 `#entrySection`(补充录入表单), 自动填入 `pushDetectDate`=today
- 若 status==='done': 显示 `#doneSection`(录入摘要), 隐藏 `#entrySection`

### 4.4 确认录入

`confirmPushEntry()`:
- 校验 `pushBatchId` 非空, `pushDetectDate` 非空
- 若未通过 → `message.error` 样式提示
- 若通过 → pushData[row].status='done', 填入 operator/entryTime/batch/auditHash
- 重新渲染推送列表(该行变为"已录入")
- 预览面板自动切换到只读摘要视图
- 追加到「我的最近录入」表(动态插入 `<tr>`)
- `message.success` 提示"已写入审计追踪"

### 4.5 关闭预览

`closePreview()` — 隐藏 `#pushPreview`, 清除所有 `.selected`

### 4.6 与现有 JS 的兼容

- 新增函数独立命名空间(不冲突现有 `submitEntry` / `resetForm` / `onFileSelect`)
- `currentUser` 复用现有变量
- 不修改现有表单的 `submitEntry` 逻辑
