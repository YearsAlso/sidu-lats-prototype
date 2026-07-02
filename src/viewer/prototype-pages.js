// SIDU-LATS 原型页面注册表
// 供 viewer 外壳生成侧栏分组导航。新增页面只需在此登记,并在 vite.config.js 的 input 中补一项。

export const DEFAULT_PAGE = 'prototype/index.html';

export const prototypeGroups = [
  {
    id: 'entry',
    label: '入口',
    items: [
      { path: 'index.html', label: '根入口(跳转)' },
      { path: 'prototype/index.html', label: '角色选择器' },
    ],
  },
  {
    id: 'prototype',
    label: '角色演示(prototype/)',
    items: [
      { path: 'prototype/admin/login.html', label: 'Admin 登录' },
      { path: 'prototype/admin/dashboard.html', label: 'Admin 仪表盘' },
      { path: 'prototype/admin/user-management.html', label: 'Admin 用户管理' },
      { path: 'prototype/admin/token-management.html', label: 'Admin Token 管理' },
      { path: 'prototype/admin/system-settings.html', label: 'Admin 系统设置' },
      { path: 'prototype/admin/storage.html', label: 'Admin 存储管理' },
      { path: 'prototype/admin/report-export.html', label: 'Admin 报告导出' },
      { path: 'prototype/admin/notifications.html', label: 'Admin 通知中心' },
      { path: 'prototype/operator/login.html', label: 'Operator 登录' },
      { path: 'prototype/operator/dashboard.html', label: 'Operator 仪表盘' },
      { path: 'prototype/operator/data-entry.html', label: 'Operator 数据录入' },
      { path: 'prototype/auditor/login.html', label: 'Auditor 登录' },
      { path: 'prototype/auditor/dashboard.html', label: 'Auditor 仪表盘' },
      { path: 'prototype/auditor/audit-log.html', label: 'Auditor 审计日志' },
      { path: 'prototype/auditor/hash-chain.html', label: 'Auditor 哈希链' },
      { path: 'prototype/auditor/storage.html', label: 'Auditor 存储管理' },
      { path: 'prototype/auditor/report-export.html', label: 'Auditor 报告导出' },
      { path: 'prototype/auditor/permission-review.html', label: 'Auditor 权限复审' },
      { path: 'prototype/reviewer/login.html', label: 'Reviewer 登录' },
      { path: 'prototype/reviewer/dashboard.html', label: 'Reviewer 仪表盘' },
      { path: 'prototype/reviewer/approval.html', label: 'Reviewer 报告复核' },
    ],
  },
];

export const prototypePages = prototypeGroups.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupId: group.id,
    groupLabel: group.label,
    id: item.path.replace(/[/.]/g, '-'),
  })),
);

export const prototypePageMap = new Map(
  prototypePages.map((page) => [page.path, page]),
);
