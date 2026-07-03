import {resolve} from 'node:path';
import {defineConfig} from 'vite';
import legacy from '@vitejs/plugin-legacy'

// SIDU-LATS Vite 多页配置
// rollupOptions.input 登记 prototype/ 下 19 个已有 HTML 入口(阶段 2,后续阶段追加)
// 原型页保持自包含(内联 style/script),Vite 仅作多页打包/原样拷贝,不抽公共资源
export default defineConfig({
    base: './',
    server: {
        open: '/',
    },
    plugins: [legacy({
        targets: ["defaults", "not IE 11"]
    })],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                viewer: resolve(__dirname, 'viewer.html'),
                'prototype-index': resolve(__dirname, 'prototype/index.html'),
                // admin (8 页)
                'prototype-admin-login': resolve(__dirname, 'prototype/admin/login.html'),
                'prototype-admin-dashboard': resolve(__dirname, 'prototype/admin/dashboard.html'),
                'prototype-admin-user-management': resolve(__dirname, 'prototype/admin/user-management.html'),
                'prototype-admin-token-management': resolve(__dirname, 'prototype/admin/token-management.html'),
                'prototype-admin-system-settings': resolve(__dirname, 'prototype/admin/system-settings.html'),
                'prototype-admin-storage': resolve(__dirname, 'prototype/admin/storage.html'),
                'prototype-admin-report-export': resolve(__dirname, 'prototype/admin/report-export.html'),
                'prototype-admin-notifications': resolve(__dirname, 'prototype/admin/notifications.html'),
                // operator (3 页,阶段 3 加 data-entry)
                'prototype-operator-login': resolve(__dirname, 'prototype/operator/login.html'),
                'prototype-operator-dashboard': resolve(__dirname, 'prototype/operator/dashboard.html'),
                'prototype-operator-data-entry': resolve(__dirname, 'prototype/operator/data-entry.html'),
                // auditor (6 页,阶段 4-5 加 permission-review/storage/report-export)
                'prototype-auditor-login': resolve(__dirname, 'prototype/auditor/login.html'),
                'prototype-auditor-dashboard': resolve(__dirname, 'prototype/auditor/dashboard.html'),
                'prototype-auditor-audit-log': resolve(__dirname, 'prototype/auditor/audit-log.html'),
                'prototype-auditor-hash-chain': resolve(__dirname, 'prototype/auditor/hash-chain.html'),
                'prototype-auditor-storage': resolve(__dirname, 'prototype/auditor/storage.html'),
                'prototype-auditor-report-export': resolve(__dirname, 'prototype/auditor/report-export.html'),
                'prototype-auditor-permission-review': resolve(__dirname, 'prototype/auditor/permission-review.html'),
                // reviewer (3 页,新建)
                'prototype-reviewer-login': resolve(__dirname, 'prototype/reviewer/login.html'),
                'prototype-reviewer-dashboard': resolve(__dirname, 'prototype/reviewer/dashboard.html'),
                'prototype-reviewer-approval': resolve(__dirname, 'prototype/reviewer/approval.html'),
            },
        },
    },
});
