# SIDU-LATS 去 AI 味视觉改造设计

**日期**: 2026-07-01
**范围**: `sidu-lats-prototype` 目录下 20 个 HTML 文件
**目标**: 把 Ant Design 风格的"AI 视觉套件"替换为工程化、合规导向的视觉规范

## 1. 背景

`sidu-lats-prototype` 是 SIDU-LATS 缺陷识别数据存管系统(FDA 21 CFR Part 11 合规版)的交互原型,部署在 GitHub Pages。20 个 HTML 文件共约 5500 行,目前视觉高度同质化为 Ant Design 浅色后台风:

- 主色 `#1890ff`(Ant 蓝,典型 AI 偏好色)
- 灰底 `#f0f2f5` + 白卡片
- 6/8/10/12px 圆角逐级叠加
- `0 8px 32px rgba(0,0,0,0.2)` 立体阴影
- 大量 emoji(`💡📊🔗✅👤💾📥`)作为图标
- 紫色/青色渐变背景(`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)
- 每个页面都重抄一遍 `.header / .layout-sider / .menu-item / .card / .btn-*` 类

这套组合在审美上偏"AI 套模板",与"FDA 合规系统"应有的"工程严谨"气质不匹配。

## 2. 设计目标

- 视觉去 AI 化:换皮不换骨,不改 JS 逻辑、不改 DOM 结构
- 行业化:从"通用浅色后台"转向"合规/工程系统"的视觉语言
- 维持零依赖:不引入构建工具、不改文件相对路径,保持"双击可跑"
- 全量一致:20 个文件统一处理,不留新旧混杂

## 3. 色组替换表(全 20 个文件统一)

| 旧值(Ant AI 风) | 新值(工程合规风) | 用途 |
|---|---|---|
| `#1890ff` | `#1f3a5f` | 主色 — 深蓝灰 |
| `#40a9ff` | `#2d5483` | 主色 hover |
| `#096dd9` | `#15293f` | 主色 active |
| `#f0f2f5` | `#f4f5f7` | 页面底色 |
| `#fff` | `#ffffff` | 卡片 |
| `#fafafa` | `#fbfbfc` | 表头 |
| `#f0f0f0` | `#e8eaed` | 分隔线 |
| `#d9d9d9` | `#d0d4dc` | 边框 |
| `#f5f5f5` | `#f0f2f5` | 二级底 |
| `#666` | `#5a6373` | 副文本 |
| `#999` | `#8a93a3` | 弱化文本 |
| `#333` | `#1f2937` | 主文本 |
| `#52c41a` | `#0f7b3a` | 成功 |
| `#f6ffed` | `#e8f3ec` | 成功浅底 |
| `#b7eb8f` | `#9bccaf` | 成功描边 |
| `#faad14` | `#a36404` | 警告 |
| `#fffbe6` | `#faf2e0` | 警告浅底 |
| `#ffe58f` | `#e6c890` | 警告描边 |
| `#ff4d4f` | `#b3261e` | 错误 |
| `#fff2f0` | `#f7e7e5` | 错误浅底 |
| `#ffccc7` | `#d9a8a3` | 错误描边 |
| `#722ed1` | `#5b3a8c` | 紫色 |
| `#f9f0ff` | `#efe7f5` | 紫色浅底 |
| `#d3adf7` | `#b89cd1` | 紫色描边 |
| `#e6f7ff` | `#e6edf5` | 信息浅底 |
| `#91d5ff` | `#a8b8cf` | 信息描边 |
| `#36cfc9` | `#3a8074` | 青色 |

## 4. 字体栈替换

- 旧:`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- 新:`-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif`
- 等宽字段(哈希值/版本号)保持:`'SF Mono', ui-monospace, 'Cascadia Mono', Menlo, monospace`

## 5. 圆角替换

| 旧 | 新 | 用例 |
|---|---|---|
| `2px` | `2px` | 哈希 chip、tag |
| `4px` | `4px` | 按钮、输入框 |
| `6px` | `4px` | 小卡片 |
| `8px` | `6px` | 主卡片(整体降 2px) |
| `10px` | `6px` | 模态框 |
| `12px` | `4px` | 极少(logo 区) |

效果:不再"每张卡片都圆得一模一样",降低模板感。

## 6. 阴影替换

| 旧 | 新 |
|---|---|
| `0 8px 32px rgba(0,0,0,0.2)` | `0 1px 0 rgba(15,23,42,0.04)` |
| `0 2px 8px rgba(0,0,0,0.06)` | `0 1px 2px rgba(15,23,42,0.04)` |
| `0 1px 4px rgba(0,0,0,0.08)` | `0 1px 2px rgba(15,23,42,0.04)` |

效果:从"立体浮起"改为"近平面边界",符合后台系统的"文档感"。

## 7. 渐变处理

- `index.html` body 背景 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` → 纯色 `#f4f5f7`
- `pages/dashboard.html` 进度条 `linear-gradient(90deg, #1890ff, #36cfc9)` → 纯色 `#1f3a5f`

## 8. emoji 处理

- `💡` 演示说明框 → 删除整块
- 侧栏菜单 `📊📋🔗✅👤💾📥` → 全部去掉,只留文字
- README.md 内的 emoji 不动(项目文档)

## 9. 文案替换

| 旧 | 新 |
|---|---|
| `缺陷识别数据存管系统 · 合规版` | `缺陷识别数据存管系统` |
| `系统正常` | `服务运行中` |
| `操作员: 张明` | `当前用户 / 张明` |
| `退出` | `注销` |
| `演示说明` 区块 | 删除 |
| `FDA 21 CFR Part 11` badge | 保留(品牌要素) |

## 10. 范围与执行顺序

20 个文件分批改,先定基线、再批量化:

1. `index.html` — 改色组 + 改字体 + 删渐变 + 改文案(登录页基线)
2. `pages/login.html` — 同步
3. `pages/dashboard.html` — 主仪表盘(出现频率最高的样式基线)
4. `pages/audit-log.html`
5. `pages/hash-chain.html`
6. `pages/approval.html`
7. `pages/user-management.html`
8. `pages/storage.html`
9. `pages/report-export.html`
10. `pages/notifications.html`
11. `pages/system-settings.html`
12. `pages/token-management.html`
13. `roles/admin/admin-login.html`
14. `roles/admin/admin-dashboard.html`
15. `roles/operator/operator-login.html`
16. `roles/operator/operator-dashboard.html`
17. `roles/auditor/auditor-login.html`
18. `roles/auditor/auditor-dashboard.html`
19. `roles/viewer/viewer-login.html`
20. `roles/viewer/viewer-dashboard.html`

## 11. 验证

- 浏览器打开 `index.html`,输入任意用户名密码(≥4 位)登录
- 跳转到 `pages/dashboard.html`,检查:无残留蓝色、字体已换、阴影变薄
- 点侧栏 9 个菜单全部可跳转,无样式断层
- 切换 4 个角色入口均正常
- FDA 21 CFR Part 11 badge 仍可见
- `git diff` 检查:仅 CSS/HTML 文本改动,无 JS/DOM 结构变化

## 12. 不做什么(明确边界)

- 不改 JS 逻辑、不改事件处理、不改 DOM 结构
- 不抽公共 CSS 文件(避免改路径破坏"双击可跑"特性)
- 不改 hash/版本号/时间戳等真实数据
- 不改 README.md(项目元信息)
- 不引入构建工具、Tailwind、PostCSS

## 13. 风险评估

- **低风险**:仅 CSS 颜色/圆角/阴影/字体/文案/emoji 替换,无逻辑变化
- **回滚成本**:单次 `git checkout HEAD -- <file>` 即可回滚任一文件
- **样式残留风险**:每个文件都独立写 `<style>`,无遗漏可保证 100% 替换
