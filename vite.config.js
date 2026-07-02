import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// SIDU-LATS Vite 多页配置
// rollupOptions.input 登记全部 36 个入口(根 index.html 跳转 + prototype/ 34 页 + viewer.html 外壳)
// 原型页保持自包含(内联 style/script),Vite 仅作多页打包/原样拷贝,不抽公共资源
export default defineConfig({
  base: './',
  server: {
    open: '/viewer.html',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        viewer: resolve(__dirname, 'viewer.html'),
        'prototype-index': resolve(__dirname, 'prototype/index.html'),
        'prototype-admin-login': resolve(__dirname, 'prototype/admin/login.html'),
        'prototype-admin-dashboard': resolve(__dirname, 'prototype/admin/dashboard.html'),
        'prototype-admin-audit-log': resolve(__dirname, 'prototype/admin/audit-log.html'),
        'prototype-admin-hash-chain': resolve(__dirname, 'prototype/admin/hash-chain.html'),
        'prototype-admin-approval': resolve(__dirname, 'prototype/admin/approval.html'),
        'prototype-admin-user-management': resolve(__dirname, 'prototype/admin/user-management.html'),
        'prototype-admin-token-management': resolve(__dirname, 'prototype/admin/token-management.html'),
        'prototype-admin-system-settings': resolve(__dirname, 'prototype/admin/system-settings.html'),
        'prototype-admin-storage': resolve(__dirname, 'prototype/admin/storage.html'),
        'prototype-admin-report-export': resolve(__dirname, 'prototype/admin/report-export.html'),
        'prototype-admin-notifications': resolve(__dirname, 'prototype/admin/notifications.html'),
        'prototype-operator-login': resolve(__dirname, 'prototype/operator/login.html'),
        'prototype-operator-dashboard': resolve(__dirname, 'prototype/operator/dashboard.html'),
        'prototype-operator-audit-log': resolve(__dirname, 'prototype/operator/audit-log.html'),
        'prototype-operator-approval': resolve(__dirname, 'prototype/operator/approval.html'),
        'prototype-operator-report-export': resolve(__dirname, 'prototype/operator/report-export.html'),
        'prototype-auditor-login': resolve(__dirname, 'prototype/auditor/login.html'),
        'prototype-auditor-dashboard': resolve(__dirname, 'prototype/auditor/dashboard.html'),
        'prototype-auditor-audit-log': resolve(__dirname, 'prototype/auditor/audit-log.html'),
        'prototype-auditor-hash-chain': resolve(__dirname, 'prototype/auditor/hash-chain.html'),
        'prototype-auditor-approval': resolve(__dirname, 'prototype/auditor/approval.html'),
        'prototype-auditor-report-export': resolve(__dirname, 'prototype/auditor/report-export.html'),
        'prototype-viewer-login': resolve(__dirname, 'prototype/viewer/login.html'),
        'prototype-viewer-dashboard': resolve(__dirname, 'prototype/viewer/dashboard.html'),
        'prototype-viewer-audit-log': resolve(__dirname, 'prototype/viewer/audit-log.html'),
        'prototype-viewer-hash-chain': resolve(__dirname, 'prototype/viewer/hash-chain.html'),
        'prototype-viewer-approval': resolve(__dirname, 'prototype/viewer/approval.html'),
        'prototype-viewer-user-management': resolve(__dirname, 'prototype/viewer/user-management.html'),
        'prototype-viewer-token-management': resolve(__dirname, 'prototype/viewer/token-management.html'),
        'prototype-viewer-system-settings': resolve(__dirname, 'prototype/viewer/system-settings.html'),
        'prototype-viewer-storage': resolve(__dirname, 'prototype/viewer/storage.html'),
        'prototype-viewer-report-export': resolve(__dirname, 'prototype/viewer/report-export.html'),
        'prototype-viewer-notifications': resolve(__dirname, 'prototype/viewer/notifications.html'),
      },
    },
  },
});
