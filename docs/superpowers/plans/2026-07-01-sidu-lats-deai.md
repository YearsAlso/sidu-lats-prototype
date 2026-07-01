# SIDU-LATS 去 AI 味视觉改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 20 个 HTML 文件的 Ant AI 视觉套件替换为工程化、合规导向的视觉规范,纯 CSS/HTML 文本改动,不动 JS 逻辑、不动 DOM 结构。

**Architecture:** 按"基线先行、批量化跟进"分四批:基线 1(登录页)→ 基线 2(主仪表盘)→ 批量 1(其余 9 个 pages)→ 批量 2(8 个 role 页)。每批以 commit 结束,便于回滚。

**Tech Stack:** 纯 HTML + 内联 CSS,无构建工具,无依赖。验证用浏览器手测(打开 `index.html` 走通登录跳转)。

**关联 spec:** `docs/superpowers/specs/2026-07-01-sidu-lats-deai-design.md`

---

## 通用替换字典(每个任务都用)

### 色组(sed 替换即可,整文件范围内)
| 旧 | 新 |
|---|---|
| `#1890ff` | `#1f3a5f` |
| `#40a9ff` | `#2d5483` |
| `#096dd9` | `#15293f` |
| `#f0f2f5` | `#f4f5f7` |
| `#fafafa` | `#fbfbfc` |
| `#f0f0f0` | `#e8eaed` |
| `#d9d9d9` | `#d0d4dc` |
| `#f5f5f5` | `#f0f2f5` |
| `#666` | `#5a6373` |
| `#999` | `#8a93a3` |
| `#333` | `#1f2937` |
| `#52c41a` | `#0f7b3a` |
| `#f6ffed` | `#e8f3ec` |
| `#b7eb8f` | `#9bccaf` |
| `#faad14` | `#a36404` |
| `#fffbe6` | `#faf2e0` |
| `#ffe58f` | `#e6c890` |
| `#ff4d4f` | `#b3261e` |
| `#fff2f0` | `#f7e7e5` |
| `#ffccc7` | `#d9a8a3` |
| `#722ed1` | `#5b3a8c` |
| `#f9f0ff` | `#efe7f5` |
| `#d3adf7` | `#b89cd1` |
| `#e6f7ff` | `#e6edf5` |
| `#91d5ff` | `#a8b8cf` |
| `#36cfc9` | `#3a8074` |
| `#667eea` | (删除渐变后此色不出现) |
| `#764ba2` | (删除渐变后此色不出现) |

### 字体
| 旧 | 新 |
|---|---|
| `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif` |
| `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif` |

### 圆角
| 旧 | 新 |
|---|---|
| `border-radius: 6px;` (小卡片/小输入) | `border-radius: 4px;` |
| `border-radius: 8px;` (主卡片) | `border-radius: 6px;` |
| `border-radius: 10px;` (模态框) | `border-radius: 6px;` |
| `border-radius: 12px;` (登录框) | `border-radius: 4px;` |

### 阴影
| 旧 | 新 |
|---|---|
| `box-shadow: 0 8px 32px rgba(0,0,0,0.2);` | `box-shadow: 0 1px 0 rgba(15,23,42,0.04);` |
| `box-shadow: 0 2px 8px rgba(0,0,0,0.06);` | `box-shadow: 0 1px 2px rgba(15,23,42,0.04);` |
| `box-shadow: 0 1px 4px rgba(0,0,0,0.08);` | `box-shadow: 0 1px 2px rgba(15,23,42,0.04);` |
| `box-shadow: 2px 0 8px rgba(0,0,0,0.06);` | `box-shadow: 1px 0 0 rgba(15,23,42,0.04);` |

### 渐变(整体删除或改纯色)
- `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);` → `background: #f4f5f7;`
- `background: linear-gradient(90deg, #1890ff, #36cfc9);` → `background: #1f3a5f;`

### 文本与图标(用 Edit 工具,精确替换)
- 侧栏菜单 emoji:`📊仪表盘` → `仪表盘`、`📋审计日志` → `审计日志`、`🔗哈希链` → `哈希链`、`✅审批中心` → `审批中心`、`👤用户管理` → `用户管理`、`💾存储管理` → `存储管理`、`📥报告导出` → `报告导出`、`🔔通知中心` → `通知中心`、`⚙系统设置` → `系统设置`、`🔑Token 管理` → `Token 管理`(如有其它 emoji 图标同样去除)
- 标题: `缺陷识别数据存管系统 · 合规版` → `缺陷识别数据存管系统`
- 状态文字: `系统正常` → `服务运行中`
- 用户: `操作员: 张明` → `当前用户 / 张明`(若其他用户名,改"当前用户 / <原名>")
- 按钮: `退出` → `注销`
- 删除 `💡 演示说明:任意用户名 + 任意密码(≥4位)即可登录` 整块 `<div class="demo-hint">...</div>`

---

## Task 1: 改基线 1 — `index.html` 登录页

**Files:**
- Modify: `index.html`

**操作顺序(每个都用 Edit 工具,old_string 来自当前文件):**

- [ ] **Step 1.1: 改 body 字体栈**

定位:`body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; ...`

替换为:`body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif; ...`

- [ ] **Step 1.2: 改 body 背景(删紫色渐变,改纯色)**

定位:`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`

替换为:`background: #f4f5f7;`

- [ ] **Step 1.3: 改 .login-box 圆角与阴影**

定位:`border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);`

替换为:`border-radius: 4px; box-shadow: 0 1px 0 rgba(15,23,42,0.04);`

- [ ] **Step 1.4: 改 .login-logo h1 颜色**

定位:`color: #1890ff;`

替换为:`color: #1f3a5f;`

- [ ] **Step 1.5: 改 .login-logo p 颜色**

定位:`color: #666;`

替换为:`color: #5a6373;`

- [ ] **Step 1.6: 改 .fda-badge 颜色(保留品牌要素,只调饱和度)**

定位:`background: #fff7e6; color: #d46b08; border: 1px solid #ffd591;`

替换为:`background: #faf2e0; color: #a36404; border: 1px solid #e6c890;`

- [ ] **Step 1.7: 改 .form-group 颜色**

定位:`color: #333;`(label)

替换为:`color: #1f2937;`(label)

定位:`border: 1px solid #d9d9d9;`(input)

替换为:`border: 1px solid #d0d4dc;`(input)

- [ ] **Step 1.8: 改 .form-group input:focus**

定位:`border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.1);`

替换为:`border-color: #1f3a5f; box-shadow: 0 0 0 2px rgba(31,58,95,0.1);`

- [ ] **Step 1.9: 改 .btn-login 颜色**

定位:`background: #1890ff;`

替换为:`background: #1f3a5f;`

定位:`.btn-login:hover { background: #40a9ff; }`

替换为:`.btn-login:hover { background: #2d5483; }`

定位:`.btn-login:active { background: #096dd9; }`

替换为:`.btn-login:active { background: #15293f; }`

- [ ] **Step 1.10: 改 .footer-note 颜色**

定位:`color: #999;`

替换为:`color: #8a93a3;`

- [ ] **Step 1.11: 改 .error-msg 颜色**

定位:`background: #fff2f0; border: 1px solid #ffccc7; color: #ff4d4f;`

替换为:`background: #f7e7e5; border: 1px solid #d9a8a3; color: #b3261e;`

- [ ] **Step 1.12: 删 .demo-hint 整块 CSS**

定位:`.demo-hint { background: #f6ffed; border: 1px solid #b7eb8f; color: #52c41a; padding: 10px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 16px; line-height: 1.6; }`

直接删除整行。

- [ ] **Step 1.13: 删 HTML 中 .demo-hint 整块 div**

定位:`<div class="demo-hint">💡 演示说明:任意用户名 + 任意密码(≥4位)即可登录</div>`

整块删除。

- [ ] **Step 1.14: 改 HTML 标题副文本**

定位:`<p>缺陷识别数据存管系统 · 合规版</p>`

替换为:`<p>缺陷识别数据存管系统</p>`

- [ ] **Step 1.15: 验证**

打开浏览器查看 `index.html`:
- 预期:背景为浅灰(无紫色渐变)、登录框为直角矩形、按钮为深蓝灰、字体已更新、无 💡 提示块
- 打开 DevTools Console,确认无报错

- [ ] **Step 1.16: 提交**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
git add index.html
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "style(index): 替换 Ant AI 视觉为工程化色组"
```

---

## Task 2: 改基线 2 — `pages/dashboard.html` 主仪表盘

**Files:**
- Modify: `pages/dashboard.html`

**操作顺序(以下用 Edit 工具):**

- [ ] **Step 2.1: 改字体栈**

定位:`body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; ...`

替换为:`body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif; ...`

- [ ] **Step 2.2: 色组批量替换**

按"通用替换字典"中的色组表,用 Edit 工具逐色替换(整文件范围内)。注意:`#f0f2f5` 出现多次(页面底色、`:hover` 底色等),都需要换成 `#f4f5f7`;`#1890ff` 出现多次(主色、border、focus 等)都需要换成 `#1f3a5f`。

- [ ] **Step 2.3: 圆角批量替换**

`.card` 的 `border-radius: 8px;` → `border-radius: 6px;`
`.quick-action-item` 的 `border-radius: 8px;` → `border-radius: 6px;`

- [ ] **Step 2.4: 阴影批量替换**

`box-shadow: 0 2px 8px rgba(0,0,0,0.06);` → `box-shadow: 0 1px 2px rgba(15,23,42,0.04);`(header)
`box-shadow: 0 1px 4px rgba(0,0,0,0.08);` → `box-shadow: 0 1px 2px rgba(15,23,42,0.04);`(card)
`box-shadow: 2px 0 8px rgba(0,0,0,0.06);` → `box-shadow: 1px 0 0 rgba(15,23,42,0.04);`(sider)

- [ ] **Step 2.5: 删进度条渐变**

定位:`.progress-bar .fill { ... background: linear-gradient(90deg, #1890ff, #36cfc9); ... }`

替换为:`background: #1f3a5f;`(去掉 linear-gradient)

- [ ] **Step 2.6: 删侧栏菜单 emoji**

定位:`<div class="menu-item active" onclick="...">📊 仪表盘</div>`(依次)

替换为(去掉 emoji,只留文字):
```
<div class="menu-item active" onclick="...">仪表盘</div>
```

完整 7 个菜单的 emoji 都去掉:`📊📋🔗✅👤💾📥` → 删除,只留菜单名

- [ ] **Step 2.7: 改 header 状态文字**

定位:`<span>系统正常</span>`

替换为:`<span>服务运行中</span>`

- [ ] **Step 2.8: 改 header 用户与退出**

定位:`<span style="color:#666;font-size:14px;">操作员: 张明</span>`

替换为:`<span style="color:#5a6373;font-size:14px;">当前用户 / 张明</span>`

定位:`<button ...>退出</button>`

替换为:`<button ...>注销</button>`

- [ ] **Step 2.9: 验证**

打开 `pages/dashboard.html`:
- 预期:主色深蓝灰、菜单无 emoji、卡片阴影变薄、状态文字"服务运行中"、按钮"注销"、进度条纯色
- 注:此页要求已登录态,先在 `index.html` 登录再跳转

- [ ] **Step 2.10: 提交**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
git add pages/dashboard.html
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "style(dashboard): 替换 Ant AI 视觉为工程化色组"
```

---

## Task 3: 批量改其余 9 个 pages 页面

**Files:**
- Modify: `pages/audit-log.html`
- Modify: `pages/hash-chain.html`
- Modify: `pages/approval.html`
- Modify: `pages/user-management.html`
- Modify: `pages/storage.html`
- Modify: `pages/report-export.html`
- Modify: `pages/notifications.html`
- Modify: `pages/system-settings.html`
- Modify: `pages/token-management.html`

每个文件都按以下 5 类替换,**使用 Edit 工具逐文件完成**:

- [ ] **Step 3.1-3.9: 逐文件改**

对 9 个文件中的每个文件执行:

1. **字体栈替换**(同 Task 1.1)
2. **色组批量替换**(同"通用替换字典"色组表)
3. **圆角批量替换**(8px→6px、6px→4px、10px→6px、12px→4px)
4. **阴影批量替换**(同"通用替换字典"阴影表)
5. **侧栏菜单 emoji 删除**(同 Task 2.6,本批页面可能含 ⚙/🔔/🔑 等不同 emoji,全部去掉)
6. **header 文案替换**(`系统正常`→`服务运行中`、`操作员:`→`当前用户 /`、`退出`→`注销`)
7. **页面副标题改色**(`#666`→`#5a6373` 等)

> 注:`pages/approval.html` 等可能有模态框 `border-radius: 10px;` → 改为 `6px;`,模态框阴影 `0 1px 4px` → `0 1px 2px`。
> `pages/hash-chain.html` 中的 `.hash-val` 等保持等宽字体,只换底色和文字色。

- [ ] **Step 3.10: 验证**

在浏览器中从 `index.html` 登录,逐一点开侧栏 9 个菜单,确认:
- 全部可正常跳转
- 无残留的 Ant 蓝或紫色
- 无残留的 emoji 图标(除了内容里可能用到的图标)
- 阴影变薄,圆角变小

- [ ] **Step 3.11: 提交**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
git add pages/audit-log.html pages/hash-chain.html pages/approval.html \
        pages/user-management.html pages/storage.html pages/report-export.html \
        pages/notifications.html pages/system-settings.html pages/token-management.html
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "style(pages): 批量替换 9 个页面 Ant AI 视觉"
```

---

## Task 4: 批量改 8 个 role 页面(4 角色 × 登录 + 仪表盘)

**Files:**
- Modify: `roles/admin/admin-login.html`
- Modify: `roles/admin/admin-dashboard.html`
- Modify: `roles/operator/operator-login.html`
- Modify: `roles/operator/operator-dashboard.html`
- Modify: `roles/auditor/auditor-login.html`
- Modify: `roles/auditor/auditor-dashboard.html`
- Modify: `roles/viewer/viewer-login.html`
- Modify: `roles/viewer/viewer-dashboard.html`

每个文件都按以下 5 类替换:

- [ ] **Step 4.1-4.8: 逐文件改**

对 8 个文件中的每个文件执行:

1. **字体栈替换**
2. **色组批量替换**
3. **圆角批量替换**
4. **阴影批量替换**
5. **侧栏/header 文本与 emoji 处理**
   - `admin-dashboard.html` 中有 `.role-tag { background: #fff2f0; ... }` → 改 `background: #f7e7e5;`(同步色组表)
6. **登录页(login.html 系列)**: 删 demo-hint、删渐变、登录框圆角降为 4px
7. **仪表盘页(dashboard.html 系列)**: 同步基线 2 的处理

- [ ] **Step 4.9: 验证**

分别打开 4 个角色的登录页(如 `roles/admin/admin-login.html`),登录后看仪表盘:
- 4 套风格一致(深蓝灰主色、近平面阴影、小圆角)
- 4 个角色入口跳转正常
- FDA 21 CFR Part 11 徽章(若有)颜色已更新到合规饱和度

- [ ] **Step 4.10: 提交**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
git add roles/admin/admin-login.html roles/admin/admin-dashboard.html \
        roles/operator/operator-login.html roles/operator/operator-dashboard.html \
        roles/auditor/auditor-login.html roles/auditor/auditor-dashboard.html \
        roles/viewer/viewer-login.html roles/viewer/viewer-dashboard.html
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "style(roles): 批量替换 4 角色 8 页面 Ant AI 视觉"
```

---

## Task 5: 整体回归验证 + 最终提交

- [ ] **Step 5.1: 全文件残留扫描**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
grep -rn "#1890ff\|#40a9ff\|#096dd9\|#52c41a\|#faad14\|#ff4d4f\|#722ed1\|#36cfc9\|#667eea\|#764ba2" \
  --include="*.html" .
```

预期输出:空(无残留)

- [ ] **Step 5.2: emoji 残留扫描**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
grep -rn "📊\|📋\|🔗\|✅\|👤\|💾\|📥\|🔔\|⚙\|🔑\|💡" \
  --include="*.html" pages/ roles/ index.html
```

预期输出:无侧栏/header 相关的 emoji 残留(README.md 内的 emoji 不算)

- [ ] **Step 5.3: 渐变残留扫描**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
grep -rn "linear-gradient" --include="*.html" .
```

预期输出:无残留

- [ ] **Step 5.4: 端到端走查**

浏览器流程:
1. 打开 `index.html` → 任意用户名 + ≥4 位密码登录
2. 跳到 `pages/dashboard.html` → 看仪表盘
3. 依次点侧栏 9 个菜单 → 全部可访问,无样式断层
4. 退出 → 回到登录页
5. 打开 `roles/admin/admin-login.html` → 登录 → 看 admin 仪表盘
6. 同理走 operator / auditor / viewer 三个角色

- [ ] **Step 5.5: git status 确认无未提交修改**

```bash
cd /Users/mengxiang/Projects/Company/SIDU/sidu-lats-prototype
git status
```

预期:工作区干净(只有 `.idea/` 未跟踪,与本次任务无关)

- [ ] **Step 5.6: 写最终总结 commit(如需要)**

如果上面所有 commit 都已正常,无需额外 commit,本任务收尾。

---

## 自检(对照 spec)

- **spec 覆盖**:
  - §3 色组表 → Task 1.4-1.11, 2.2, 3.1-3.9, 4.1-4.8
  - §4 字体栈 → Task 1.1, 2.1, 3, 4
  - §5 圆角 → Task 1.3, 2.3, 3, 4
  - §6 阴影 → Task 1.3, 2.4, 3, 4
  - §7 渐变 → Task 1.2, 2.5
  - §8 emoji → Task 2.6, 3, 4
  - §9 文案 → Task 1.14, 2.7, 2.8, 3, 4
  - §10 范围/顺序 → Task 1→2→3→4 的执行顺序
  - §11 验证 → Task 5
- **占位符扫描**:无 TBD/TODO
- **类型一致性**:所有任务使用同一色组表(在"通用替换字典"),无不一致
