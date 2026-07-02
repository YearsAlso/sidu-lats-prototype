# Ant Design 5 默认样式规则

本文件是本项目原型页面的统一视觉与交互风格规则。凡涉及 `index.html`、`prototype/**/*.html` 的 UI 修改(色彩、间距、圆角、阴影、组件外观、布局),必须遵守本文件。

## 1. 设计定位

- 目标风格:Ant Design 5 默认视觉——现代、克制、信息清晰的中性后台风。
- 设计原则:功能优先、留白合理、状态语义化、组件即 antd 组件的纯 CSS 还原。
- 禁止方向:工业灰阶 SCADA 风、紫青渐变、毛玻璃、超大圆角立体阴影、emoji 侧栏图标、潮流动画、卡通化图标。

## 2. 强制色彩体系(antd 5 token)

| 用途 | 色值 | 说明 |
|---|---|---|
| 主色 Primary | `#1677ff` | 按钮/链接/选中态 |
| Primary hover | `#4096ff` | 主色悬停 |
| Primary active | `#0958d9` | 主色按下 |
| Primary 浅底(选中/hover bg) | `#e6f4ff` | 菜单选中、行选中 |
| Primary 描边 | `#91caff` | 信息态描边 |
| 页面底色 colorBgLayout | `#f5f5f5` | body 背景 |
| 卡片 / 容器底 | `#ffffff` | Card / Modal / 输入框底 |
| 表头 / 填充底 colorFillAlter | `#fafafa` | 表头、行 hover |
| 分隔线 colorSplit | `#f0f0f0` | 卡片标题下分隔、表格行线 |
| 边框 colorBorder | `#d9d9d9` | 输入框/按钮/default 描边 |
| 主文本 colorText | `rgba(0, 0, 0, 0.88)` | 标题、正文主色 |
| 副文本 colorTextSecondary | `rgba(0, 0, 0, 0.65)` | 说明、表单 label |
| 弱化文本 colorTextTertiary | `rgba(0, 0, 0, 0.45)` | 占位、副标题、Statistic label |
| 禁用文本 colorTextDisabled | `rgba(0, 0, 0, 0.25)` | 禁用态文字 |
| 成功 success | `#52c41a` / 浅底 `#f6ffed` / 描边 `#b7eb8f` | 通过/正常 |
| 警告 warning | `#faad14` / 浅底 `#fffbe6` / 描边 `#ffe58f` | 待处理/提醒 |
| 错误 error | `#ff4d4f` / 浅底 `#fff2f0` / 描边 `#ffccc7` | 失败/告警/作废 |
| 信息 info | `#1677ff` / 浅底 `#e6f4ff` / 描边 `#91caff` | 信息提示 |

**antd 4 → 5 迁移**(改动对应文件时必须同步):`#1890ff`→`#1677ff`、`#40a9ff`→`#4096ff`、`#096dd9`→`#0958d9`。

## 3. 控件规范

### 按钮(Button)

- primary:底 `#1677ff`、hover `#4096ff`、active `#0958d9`、文字 `#fff`。
- default:底 `#fff`、描边 `#d9d9d9`、文字 `rgba(0,0,0,0.88)`;hover 描边 `#1677ff`、文字 `#1677ff`。
- text:无边框无底,hover 底 `rgba(0,0,0,0.06)`。
- 高度 `32px`(medium)、`4px` 圆角、横向 `padding 15px`、字号 `14px`。
- 禁止:渐变、发光、毛玻璃、胶囊大圆角、复杂阴影。

### 卡片 / 分组容器(Card)

- 白底 `#ffffff`、`8px` 圆角、卡片阴影(见 §5)。
- 标题区底部 `1px solid #f0f0f0` 分隔。
- 内边距 `24px`;标题 `16px` / `500`。
- 禁止:工业灰底、强立体阴影、超大圆角。

### 表格(Table)

- 表头底 `#fafafa`、表头字 `rgba(0,0,0,0.88)` / `500`。
- 行 hover 底 `#fafafa`。
- 行分隔线 `1px solid #f0f0f0`;外框可无(antd 表格默认无线框)或 `#f0f0f0`。
- 数值、ID、哈希、版本号、tag/key-value 使用等宽字体(见 §4)。
- 空值统一显示 `—`,弱化文本色 `rgba(0,0,0,0.45)`。

### 模态框(Modal)

- 遮罩 `rgba(0, 0, 0, 0.45)`。
- 弹窗白底 `#ffffff`、`8px` 圆角、浮层阴影(见 §5)。
- 标题 `16px` / `500`、底部 `1px solid #f0f0f0` 分隔。
- 按钮仍遵守 §按钮规范。
- 禁止:工业灰弹窗、`#c0c0c0` 标题栏、毛玻璃背景。

### Tag / 状态标签

- `padding 2px 8px`、`6px` 圆角、字号 `12px`、`border 1px solid`。
- success:浅底 `#f6ffed` / 描边 `#b7eb8f` / 字 `#389e0d`。
- warning:浅底 `#fffbe6` / 描边 `#ffe58f` / 字 `#d48806`。
- error:浅底 `#fff2f0` / 描边 `#ffccc7` / 字 `#cf1322`。
- info:浅底 `#e6f4ff` / 描边 `#91caff` / 字 `#0958d9`。
- 状态点 Badge dot:8px 圆,green `#52c41a` / yellow `#faad14` / red `#ff4d4f`。

## 4. 字体规范

界面文本:

```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

等宽(哈希、版本号、ID、通道号、tag、key/value):

```
font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
```

- 字号:正文 `14px`、小字 `12px`、小标题 `16px`、页标题 `20–24px`。
- 行高 `1.5715`。
- 字重以常规(`400`)为主,表头/标题/关键状态用 `500`,仅页标题可用 `600`。
- 禁止 Arial/Helvetica 作为主界面字体(那是工业风遗留)。

## 5. 间距、圆角、阴影

**间距(8 的倍数)**:`4 / 8 / 12 / 16 / 20 / 24 / 32`。卡片内边距 `24px`,控件高度默认 `32px`。

**圆角**:

| token | 值 | 用途 |
|-------|-----|------|
| borderRadiusXS | `2px` | hash chip |
| borderRadiusSM | `4px` | 按钮、输入框、Select |
| borderRadius | `6px` | 小卡片、Tag |
| borderRadiusLG | `8px` | 主卡片、Modal |

**阴影**:

- 卡片浮起:`0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)`
- 侧栏 / 固定头:`0 2px 8px rgba(0,0,0,0.06)` 或更轻 `0 1px 2px rgba(0,0,0,0.03)`
- 浮层 / 下拉 / Modal:`0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)`

## 6. 布局规范(antd Layout 还原)

- 顶部固定栏 Header:白底、`64px` 高、底部 `1px solid #f0f0f0`。
- 左侧栏 Sider + Menu:`220px` 宽、白底;菜单项选中 `#e6f4ff` 底 + 左 `3px solid #1677ff` 边、字 `#1677ff` / `500`;hover 底 `#e6f4ff`。
- 内容区:底 `#f5f5f5`、内边距 `24px`。
- 面包屑:`14px`、`rgba(0,0,0,0.45)`,分隔符 `»` 或 `/`。
- 页面内部导航必须保持相对路径,不破坏 sessionStorage 鉴权流与 iframe 查看器加载方式。
- 禁止:工业宽屏 `min-w-[1920px]`、黑底图表区、紧凑高密度工业布局。

## 7. 图表规范

本项目当前不使用图表。若后续引入,必须遵循 antd 默认图表风格(@ant-design/plots / Ant Design Charts):

- 浅色背景(`#ffffff` 或透明),**禁止黑底**。
- 网格线 `rgba(0,0,0,0.06)`、坐标轴字 `rgba(0,0,0,0.45)`。
- 曲线/柱状使用 antd 默认色板 `['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']`。
- tooltip 白底 `#ffffff`、`rgba(0,0,0,0.88)` 文字、`4px` 圆角、卡片阴影。
- 禁止:黑底荧光曲线、Consolas 等宽坐标轴、`animation: false` 工业风配置。

## 8. 技术约束

- 原型页单文件 HTML,CSS/JS 内联,**不抽公共 CSS/JS 文件**(双击可跑原则)。
- 不引入 antd JS 库、不引入 Tailwind、不引入任何外部 CDN 样式/框架;用纯 CSS 还原 antd 组件视觉。
- 交互使用原生 JavaScript,禁止 React/Vue 等框架。
- 不改 JS 逻辑与 DOM 结构,不改 sessionStorage 鉴权流(`lats_logged_in` / `lats_user`)。
- 不改真实数据:哈希值、版本号、时间戳、审计记录内容保持原样。
- 页面必须可直接在浏览器或 Vite viewer iframe 中运行,无控制台报错。
- 不确定是否新增 CDN、改布局、改字段、改业务语义时,先按 `.claude/rules/working-rules.md` 提问。

## 9. 自查清单

修改或生成 UI 后必须核对:

- [ ] 色彩是否全部使用 antd 5 token(无 `#1890ff`、无工业灰 `#e2e2e2/#d6d6d6/#c0c0c0`、无黑底 `#0a0a0a`)。
- [ ] 是否清除了紫青渐变、进度条渐变、emoji 侧栏图标、超大立体阴影。
- [ ] 圆角是否落在 `2/4/6/8px`(无工业 2-4px 灰按钮、无胶囊大圆角)。
- [ ] 表格表头是否 `#fafafa`、行 hover `#fafafa`、行线 `#f0f0f0`。
- [ ] 按钮/输入框是否 `32px` 高、`4px` 圆角、focus 边 `#1677ff` + `0 0 0 2px rgba(5,145,255,0.1)`。
- [ ] 数值/ID/哈希/版本号是否使用 antd 等宽字体栈。
- [ ] 页面是否保持单文件自包含(内联 `<style>`,无外部 CSS/JS、无 Tailwind)。
- [ ] 侧栏菜单路径、登录跳转(同目录 `dashboard.html`)、sessionStorage 鉴权流是否未受影响。
