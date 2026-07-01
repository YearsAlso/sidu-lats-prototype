# SIDU-LATS Phase 2 技术架构文档

**文档类型**：技术架构设计  
**版本**：v2.0  
**语言**：中文  
**更新日期**：2026-07-01  
**技术栈**：Vue3 + Ant Design Vue / Java (Spring Boot) + C# (.NET 6/8)  
**目标平台**：Windows 工控机 / Linux ARM 边缘设备

---

## 1. 背景与更新说明

### 1.1 文档目的

本文档为 SIDU-LATS 视觉检测系统 **Phase 2** 阶段的技术架构设计，延续 [FDA 合规产品路线图](./SIDU-LATS_FDA合规产品路线图.md) 中定义的 Phase 2 范围（M3 数字签名服务 + M5 密钥与身份管理），并针对以下需求进行技术落地设计：

- **前端技术栈统一**：采用 Vue3 + Ant Design Vue
- **后端技术栈支持**：Java (Spring Boot) 或 C# (.NET 6/8)
- **平台支持扩展**：补充 Windows 工控机平台架构设计
- **合规能力增强**：实现 FDA 21 CFR Part 11 要求的数字签名与密钥管理

### 1.2 与 Phase 1 的关系

| 维度 | Phase 1 | Phase 2 |
|------|---------|---------|
| **核心模块** | M1 哈希链引擎、M2 审计追踪系统 | M3 数字签名服务、M5 密钥与身份管理 |
| **前端** | 基础 Web UI | Vue3 + Ant Design Vue 完整前端 |
| **后端** | 基础 REST API | Java/C# 双后端支持 |
| **平台** | Linux ARM | Windows 工控机 + Linux ARM |
| **硬件依赖** | 可选 TPM | TPM 优先（无可用时软件方案） |

---

## 2. 技术栈选型

### 2.1 前端技术栈

| 组件 | 选型 | 版本 | 说明 |
|------|------|------|------|
| **框架** | Vue.js | 3.4+ | 组合式 API (Composition API) |
| **UI 组件库** | Ant Design Vue | 4.x | 企业级 UI 组件 |
| **状态管理** | Pinia | 2.x | 轻量级状态管理 |
| **路由** | Vue Router | 4.x | SPA 路由 |
| **HTTP 客户端** | Axios | 1.6+ | API 调用 |
| **构建工具** | Vite | 5.x | 快速构建 |
| **图表** | ECharts | 5.x | 数据可视化 |

### 2.2 后端技术栈

#### 2.2.1 Java 后端（Spring Boot）

| 组件 | 选型 | 版本 | 说明 |
|------|------|------|------|
| **框架** | Spring Boot | 3.2+ | 核心框架 |
| **安全** | Spring Security | 6.x | 认证授权 |
| **密码学** | Bouncy Castle | 1.77+ | 数字签名算法 |
| **数据库** | H2 / SQLite | - | 轻量级本地存储 |
| **API 文档** | SpringDoc OpenAPI | 2.x | API 文档生成 |
| **日志** | Logback | - | 结构化日志 |

#### 2.2.2 C# 后端（.NET）

| 组件 | 选型 | 版本 | 说明 |
|------|------|------|------|
| **框架** | .NET | 8.0 | LTS 版本 |
| **Web 框架** | ASP.NET Core | 8.x | 高性能 API |
| **安全** | Microsoft.AspNetCore.Authentication | - | 认证授权 |
| **密码学** | System.Security.Cryptography | 内置 | 数字签名算法 |
| **数据库** | SQLite | Microsoft.Data.Sqlite | 本地存储 |
| **ORM** | Entity Framework Core | 8.x | 数据库访问 |

### 2.3 技术栈对比

| 维度 | Java Spring Boot | C# .NET 8 |
|------|------------------|-----------|
| **启动速度** | 中等 | 快 |
| **内存占用** | 较高 (~200MB+) | 较低 (~100MB) |
| **Windows 集成** | 需安装 JDK | 原生支持 |
| **生态成熟度** | ★★★★★ | ★★★★☆ |
| **适合场景** | 复杂企业级应用 | 轻量 Windows 服务 |
| **学习成本** | 中 | 低 |

**推荐策略**：
- **Windows 工控机**：优先选择 C# .NET 8，原生支持 Windows 平台，服务部署简便
- **Linux ARM 边缘设备**：选择 Java Spring Boot，跨平台兼容性好
- **双后端支持**：通过统一的 OpenAPI 规范确保前端代码复用

---

## 3. 系统架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              客户端层                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Vue3 + Ant Design Vue Web UI                        │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐ │  │
│  │  │ 检测看板  │  │ 审计日志查询  │  │ 报告导出   │  │ 身份与密钥管理   │ │  │
│  │  └──────────┘  └──────────────┘  └────────────┘  └──────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS/REST
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API 网关层                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Spring Security / ASP.NET Core                      │  │
│  │              （认证、鉴权、审计日志中间件、JWT）                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│    Java Spring Boot     │ │     C# .NET 8 API       │ │    轻量消息队列          │
│    后端服务              │ │    后端服务              │ │   （本地缓存/队列）       │
│    (Linux ARM)          │ │   (Windows)             │ │                         │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              数据存储层                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  检测记录存储    │  │  审计日志存储    │  │  用户数据与密钥存储          │  │
│  │  (哈希链)       │  │  (独立哈希链)    │  │  (加密存储)                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              硬件抽象层                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  TPM 2.0        │  │  Windows CNG    │  │  软件密钥库                  │  │
│  │  (硬件签名)      │  │  (KSP)          │  │  (无可用 TPM 时)            │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Windows 平台架构设计

#### 3.2.1 Windows 工控机特征

| 特征 | 说明 |
|------|------|
| **操作系统** | Windows 10 IoT Enterprise / Windows Server 2019+ |
| **硬件形态** | x86_64 架构，工控机无风扇设计 |
| **TPM 支持** | 通常内置 fTPM 2.0（Intel PTT 或 AMD PSP） |
| **.NET 运行时** | .NET 8 Runtime 内置支持 |
| **部署方式** | Windows Service 或 IIS Host |

#### 3.2.2 Windows 平台服务架构

```
┌──────────────────────────────────────────────────────────────┐
│                    Windows 工控机                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              SIDU-LATS 检测系统                         │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              C# .NET 8 后端服务                   │  │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │  │
│  │  │  │ 签名服务   │  │ 密钥管理   │  │ 审计服务   │  │  │  │
│  │  │  │ (ECDSA)   │  │ (CNG KSP)  │  │ (哈希链)   │  │  │  │
│  │  │  └────────────┘  └────────────┘  └────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                          │                             │  │
│  │  ┌───────────────────────▼──────────────────────────┐  │  │
│  │  │              Windows CNG / TPM 2.0                │  │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │  │
│  │  │  │ TPM 密钥存储│  │ 硬件签名   │  │ PCR 扩展   │  │  │  │
│  │  │  │ (KSP)     │  │ (ECDSA P-256)│  │ (可选)     │  │  │  │
│  │  │  └────────────┘  └────────────┘  └────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │              本地 SQLite 数据库                        │  │
│  │  (检测记录哈希链 / 审计日志 / 用户数据)                │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### 3.2.3 Windows 平台关键组件

| 组件 | 实现方式 | 说明 |
|------|----------|------|
| **TPM 访问** | Windows TBS (TPM Base Services) + CNG KSP | 通过 CNG 的 TPM Key Storage Provider |
| **密钥存储** | CNG Key Storage Provider | 支持 ECDSA P-256 密钥的硬件级存储 |
| **签名服务** | System.Security.Cryptography.Cng | 配合 CNG 实现硬件签名 |
| **数据库** | SQLite + Microsoft.Data.Sqlite | 轻量级本地存储 |
| **服务部署** | .NET Worker Service | 后台长期运行服务 |
| **日志审计** | Windows Event Log + 文件日志 | 双通道审计 |

### 3.3 Linux ARM 平台架构设计

```
┌──────────────────────────────────────────────────────────────┐
│                    Linux ARM 边缘设备                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Java Spring Boot 后端服务                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │ 签名服务   │  │ 密钥管理   │  │ 审计服务   │  │  │
│  │  │ (ECDSA)   │  │ (PKCS#11)  │  │ (哈希链)   │  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              TPM 2.0 / SoftTPM                    │  │  │
│  │  │  (通过 PKCS#11 或直接 TSS 调用)                   │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │              H2 / SQLite 本地数据库                    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Phase 2 核心模块设计

### 4.1 M3：数字签名服务

#### 4.1.1 签名算法选型

| 算法 | 适用场景 | 说明 |
|------|----------|------|
| **ECDSA P-256** | 首选 | 安全性与性能平衡，NIST 推荐曲线 |
| **RSA-2048** | 兼容场景 | 传统方案，计算量较大 |
| **HMAC-SHA256** | 无硬件场景 | 对称方案，密钥保护依赖软件 |

#### 4.1.2 签名数据结构

```json
{
  "signature_id": "uuid-v4",
  "detection_record_id": "ref-to-detection-record",
  "signer_id": "user-uuid",
  "signer_certificate_thumbprint": "sha256-thumbprint",
  "algorithm": "ECDSA_P256",
  "signed_data": {
    "record_hash": "sha256-of-detection-record",
    "timestamp": "iso-8601",
    "meaning": "I confirm this detection result"
  },
  "signature_value": "base64-encoded-signature",
  "tpm_quote": "optional-tpm-attestation",
  "chain_hash": "previous-signature-hash"
}
```

#### 4.1.3 Windows 平台签名实现（C#）

```csharp
// C# .NET 8 签名服务核心逻辑
public class SignatureService
{
    private readonly ECDsa _signingKey;
    private readonly string _keyId;
    
    public SignatureService(bool useTpm = true)
    {
        if (useTpm && Tpm2Available())
        {
            // 使用 TPM 存储的密钥
            _signingKey = GetTpmKey(CngKeyAlgorithm.ECDsaP256);
            _keyId = "tpm://ecdhe-p256/sidu-signing";
        }
        else
        {
            // 软件密钥库（密钥受 DPAPI 保护）
            _signingKey = GetSoftwareKey();
            _keyId = "sw://ecdhe-p256/sidu-signing";
        }
    }
    
    public SignatureResult Sign(DetectionRecord record, string meaning)
    {
        var dataToSign = ComputeDataHash(record);
        var signature = _signingKey.SignData(
            dataToSign, 
            HashAlgorithmName.SHA256, 
            DSASignatureFormat.Rfc3279DerSequence);
        
        return new SignatureResult
        {
            SignatureValue = Convert.ToBase64String(signature),
            Algorithm = "ECDSA_P256",
            KeyId = _keyId,
            SignedAt = DateTimeOffset.UtcNow
        };
    }
}
```

#### 4.1.4 Java Spring Boot 签名实现

```java
// Java Spring Boot 签名服务核心逻辑
@Service
public class SignatureService {
    
    private final KeyStore keyStore;
    private final String keyAlias;
    
    @Autowired
    public SignatureService(@Value("${sidu.signing.key.algorithm:ECDSA}") String algorithm) {
        this.keyStore = loadKeyStore();
        this.keyAlias = "sidu-signing-key";
    }
    
    public SignatureResult sign(DetectionRecord record, String meaning) {
        byte[] dataToSign = computeDataHash(record);
        Signature sig = Signature.getInstance("SHA256withECDSA");
        sig.initSign(getPrivateKey());
        sig.update(dataToSign);
        byte[] signature = sig.sign();
        
        return SignatureResult.builder()
            .signatureValue(Base64.getEncoder().encodeToString(signature))
            .algorithm("ECDSA_P256")
            .keyId(keyAlias)
            .signedAt(Instant.now())
            .build();
    }
    
    private PrivateKey getPrivateKey() {
        // 支持 PKCS#11 (TPM) 或软件密钥库
        return keyStore.getKey(keyAlias, null);
    }
}
```

### 4.2 M5：密钥与身份管理

#### 4.2.1 身份模型

```json
{
  "user_id": "uuid-v4",
  "username": "operator_001",
  "display_name": "张伟",
  "role": "QUALITY_INSPECTOR",
  "department": "质量部",
  "email": "zhangwei@factory.local",
  "signing_certificate_thumbprint": "sha256-thumbprint",
  "key_storage_type": "TPM | SOFTWARE",
  "created_at": "iso-8601",
  "status": "ACTIVE | DISABLED",
  "password_hash": "argon2-hash"
}
```

#### 4.2.2 Windows 平台密钥管理

```csharp
// Windows CNG 密钥存储实现
public class WindowsKeyManagementService : IKeyManagementService
{
    public void CreateSigningKey(string userId, bool useTpm)
    {
        var keyParams = new CngKeyCreationParameters
        {
            KeyUsage = CngKeyUsages.Signing,
            Provider = useTpm ? "Microsoft TPM Key Storage Provider" : "Microsoft Software Key Storage Provider",
            Parameters = { new CngProperty("Length", BitConverter.GetBytes(256), CngPropertyOptions.None) }
        };
        
        using var key = CngKey.Create(CngAlgorithm.ECDsaP256, $"sidu-user-{userId}", keyParams);
        // 密钥自动持久化到 TPM 或软件密钥库
    }
    
    public byte[] SignData(string userId, byte[] data)
    {
        using var key = CngKey.Open($"sidu-user-{userId}");
        using var ecdsa = new ECDsaCng(key);
        return ecdsa.SignData(data, HashAlgorithmName.SHA256, DSASignatureFormat.Rfc3279DerSequence);
    }
}
```

#### 4.2.3 Java PKCS#11 密钥管理

```java
// Java PKCS#11 密钥管理实现
@Configuration
public class Pkcs11Configuration {
    
    @Bean
    public Provider getPkcs11Provider() {
        // 配置指向 TPM 或 SoftTPM 的 PKCS#11 模块
        Provider provider = new sun.security.pkcs11.SunPKCS11(
            getConfigFilePath()  // 指向 /etc/softhsm2.conf 或 TPM 驱动
        );
        Security.addProvider(provider);
        return provider;
    }
    
    @Bean
    public KeyStore getTpmKeyStore(Provider pkcs11Provider) throws KeyStoreException {
        KeyStore ks = KeyStore.getInstance("PKCS11", pkcs11Provider);
        ks.load(null, null);  // TPM 密钥无需密码加载
        return ks;
    }
}
```

### 4.3 RBAC 权限控制

| 角色 | 权限说明 | 对应 FDA 要求 |
|------|----------|---------------|
| **ADMIN** | 系统配置、用户管理、密钥管理 | 11.100 签名唯一性管理 |
| **QUALITY_MANAGER** | 检测结果审核、电子签名、报告导出 | 11.50 签名关联 |
| **QUALITY_INSPECTOR** | 提交检测结果、查看本人记录 | 11.10(a) 记录完整性 |
| **AUDITOR** | 查看所有审计日志、验证签名 | 11.10(e) 审计追踪 |
| **OPERATOR** | 基础检测操作、无签名权限 | - |

---

## 5. API 接口设计

### 5.1 核心 API 列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `POST` | `/api/v1/auth/login` | 用户登录 | 无 |
| `POST` | `/api/v1/auth/logout` | 用户登出 | JWT |
| `GET` | `/api/v1/users` | 获取用户列表 | ADMIN |
| `POST` | `/api/v1/users` | 创建用户 | ADMIN |
| `PUT` | `/api/v1/users/{id}/status` | 启用/禁用用户 | ADMIN |
| `POST` | `/api/v1/signatures` | 对检测结果签名 | QUALITY_* |
| `GET` | `/api/v1/signatures/{id}` | 获取签名详情 | JWT |
| `POST` | `/api/v1/signatures/{id}/verify` | 验证签名 | JWT |
| `GET` | `/api/v1/audit-logs` | 查询审计日志 | AUDITOR |
| `POST` | `/api/v1/reports/export` | 导出合规报告 | QUALITY_* |
| `GET` | `/api/v1/health` | 健康检查 | 无 |

### 5.2 签名 API 详细设计

#### POST /api/v1/signatures

**请求体**：
```json
{
  "detection_record_id": "uuid-v4",
  "meaning": "I confirm this detection result is accurate",
  "password": "user-password-for-signing"
}
```

**响应体**：
```json
{
  "signature_id": "uuid-v4",
  "status": "VALID",
  "algorithm": "ECDSA_P256",
  "key_id": "tpm://ecdhe-p256/sidu-signing",
  "signed_at": "2026-07-01T10:30:00Z",
  "record_hash": "sha256-hex-string",
  "signature_value": "base64-string"
}
```

#### POST /api/v1/signatures/{id}/verify

**响应体**：
```json
{
  "signature_id": "uuid-v4",
  "verification_result": {
    "integrity": true,
    "signer_valid": true,
    "algorithm_valid": true,
    "not_expired": true
  },
  "signer_info": {
    "user_id": "uuid-v4",
    "username": "zhangwei",
    "display_name": "张伟",
    "role": "QUALITY_INSPECTOR"
  },
  "tpm_attestation": {
    "quote_valid": true,
    "pcr_values": ["sha256-hex", "sha256-hex"]
  }
}
```

---

## 6. 前端架构设计

### 6.1 项目结构

```
sidu-lats-frontend/
├── src/
│   ├── api/                    # API 调用层
│   │   ├── index.ts           # Axios 实例配置
│   │   ├── auth.ts            # 认证 API
│   │   ├── signature.ts       # 签名 API
│   │   ├── audit.ts           # 审计 API
│   │   └── report.ts          # 报告 API
│   ├── components/            # 公共组件
│   │   ├── SignaturePanel.vue # 签名面板
│   │   ├── AuditLogTable.vue  # 审计日志表格
│   │   └── ReportExport.vue   # 报告导出
│   ├── views/                 # 页面视图
│   │   ├── Login.vue          # 登录页
│   │   ├── Dashboard.vue      # 检测看板
│   │   ├── AuditLog.vue       # 审计日志
│   │   ├── ReportCenter.vue   # 报告中心
│   │   └── UserManagement.vue # 用户管理
│   ├── stores/                # Pinia 状态管理
│   │   ├── auth.ts            # 认证状态
│   │   ├── signature.ts       # 签名状态
│   │   └── audit.ts           # 审计状态
│   ├── router/                # Vue Router
│   │   └── index.ts
│   ├── styles/                # 全局样式
│   │   └── global.less
│   ├── types/                 # TypeScript 类型
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── package.json
└── vite.config.ts
```

### 6.2 核心页面设计

#### 6.2.1 检测看板（Dashboard）

- 实时检测数据展示
- 检测结果合格/不合格统计
- 今日检测趋势图表
- 快速签名入口

#### 6.2.2 签名面板（SignaturePanel）

```vue
<template>
  <a-modal
    v-model:open="visible"
    title="电子签名确认"
    @ok="handleSign"
    :confirm-loading="loading"
  >
    <a-descriptions :column="1" bordered>
      <a-descriptions-item label="检测记录ID">
        {{ record.id }}
      </a-descriptions-item>
      <a-descriptions-item label="检测时间">
        {{ formatDateTime(record.timestamp) }}
      </a-descriptions-item>
      <a-descriptions-item label="检测结果">
        <a-tag :color="record.result === 'PASS' ? 'green' : 'red'">
          {{ record.result }}
        </a-tag>
      </a-descriptions-item>
    </a-descriptions>
    
    <a-divider />
    
    <a-form :model="signForm" layout="vertical">
      <a-form-item label="签名含义" name="meaning">
        <a-select v-model:value="signForm.meaning">
          <a-select-option value="I confirm this detection result is accurate">
            我确认此检测结果准确
          </a-select-option>
          <a-select-option value="I reviewed and approved this result">
            我已审核并批准此结果
          </a-select-option>
        </a-select>
      </a-form-item>
      
      <a-form-item label="操作密码" name="password">
        <a-input-password v-model:value="signForm.password" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { signatureApi } from '@/api/signature'
import { message } from 'ant-design-vue'

const visible = ref(false)
const loading = ref(false)
const record = ref({})

const signForm = reactive({
  meaning: 'I confirm this detection result is accurate',
  password: ''
})

const handleSign = async () => {
  loading.value = true
  try {
    const result = await signatureApi.sign({
      detection_record_id: record.value.id,
      meaning: signForm.meaning,
      password: signForm.password
    })
    message.success('签名成功')
    visible.value = false
    emit('signed', result)
  } catch (error) {
    message.error('签名失败: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
```

#### 6.2.3 审计日志查询（AuditLog）

- 支持时间范围筛选
- 支持操作类型、用户筛选
- 哈希链完整性状态显示
- 导出为 CSV/JSON

---

## 7. 数据存储设计

### 7.1 数据库 Schema

#### 7.1.1 检测记录表（Detection Records）

```sql
CREATE TABLE detection_records (
    id TEXT PRIMARY KEY,
    index INTEGER UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    data TEXT NOT NULL,           -- JSON 存储检测数据
    previous_hash TEXT NOT NULL,
    self_hash TEXT NOT NULL,
    signature_id TEXT,            -- 关联签名（可选）
    created_at TEXT NOT NULL
);

CREATE INDEX idx_detection_timestamp ON detection_records(timestamp);
CREATE INDEX idx_detection_self_hash ON detection_records(self_hash);
```

#### 7.1.2 审计日志表（Audit Logs）

```sql
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    index INTEGER UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    result TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    previous_hash TEXT NOT NULL,
    self_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
```

#### 7.1.3 用户表（Users）

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    email TEXT,
    signing_key_id TEXT,          -- 关联签名密钥
    key_storage_type TEXT NOT NULL, -- 'TPM' | 'SOFTWARE'
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_user_username ON users(username);
```

#### 7.1.4 签名记录表（Signatures）

```sql
CREATE TABLE signatures (
    id TEXT PRIMARY KEY,
    detection_record_id TEXT NOT NULL,
    signer_id TEXT NOT NULL,
    algorithm TEXT NOT NULL,
    key_id TEXT NOT NULL,
    meaning TEXT NOT NULL,
    signature_value TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    self_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (detection_record_id) REFERENCES detection_records(id),
    FOREIGN KEY (signer_id) REFERENCES users(id)
);

CREATE INDEX idx_signature_detect ON signatures(detection_record_id);
CREATE INDEX idx_signature_signer ON signatures(signer_id);
```

### 7.2 哈希链存储格式

每条记录追加存储为单行 JSONL 格式：

```
{"index":1,"timestamp":"2026-07-01T10:00:00Z","data":{...},"previous_hash":"genesis","self_hash":"abc123..."}
{"index":2,"timestamp":"2026-07-01T10:05:00Z","data":{...},"previous_hash":"abc123...","self_hash":"def456..."}
```

---

## 8. 安全设计

### 8.1 认证与授权

| 机制 | 实现 | 说明 |
|------|------|------|
| **身份认证** | JWT Bearer Token | 15分钟过期，刷新token 7天 |
| **密码存储** | Argon2id | 防暴力破解 |
| **签名验证** | 签名时验证用户密码 | 确保操作员本人操作 |
| **会话管理** | Redis/SQLite 会话存储 | 支持强制登出 |

### 8.2 TPM 安全加固

| 场景 | Windows 平台 | Linux ARM 平台 |
|------|-------------|---------------|
| **TPM 检测** | TBS_GetTPMVersionInfo | tpm2_getcap properties |
| **密钥存储** | CNG KSP (Microsoft TPM Provider) | PKCS#11 + SoftTPM/TPM2-TSS |
| **签名** | ECDsaCng + TPM key | Signature.getInstance("SHA256withECDSA") |
| **PCR 扩展** | TPM2_PCR_Extend | tpm2_pcrextend |

### 8.3 审计日志保护

- 所有管理操作（用户增删改、密钥操作）均记录审计日志
- 审计日志独立存储，与业务数据分离
- 审计日志链验证失败触发安全告警
- 禁止直接删除审计日志，只能标记状态

---

## 9. 部署架构

### 9.1 Windows 工控机部署

```
C:\Program Files\SIDU-LATS\
├── sidu-lats.exe              # .NET 8 Worker Service
├── appsettings.json           # 配置文件
├── data/
│   ├── sidu.db               # SQLite 数据库
│   ├── logs/                 # 日志文件
│   └── certs/                # 证书目录（可选）
├── scripts/
│   └── install-service.ps1   # 服务安装脚本
└── uninstall.ps1             # 卸载脚本
```

**服务安装**：
```powershell
# 使用 PowerShell 安装为 Windows Service
New-Service -Name "SIDU-LATS" -BinaryPathName "C:\Program Files\SIDU-LATS\sidu-lats.exe" -DisplayName "SIDU-LATS Backend" -StartupType Automatic
Start-Service "SIDU-LATS"
```

### 9.2 Linux ARM 部署

```bash
# Docker Compose 部署
version: '3.8'
services:
  sidu-lats:
    image: sidu-lats-backend:2.0
    container_name: sidu-lats-backend
    runtime: nvidia  # 如需 GPU 支持
    ports:
      - "8443:8443"
    volumes:
      - ./data:/app/data
      - /dev/tpm0:/dev/tpm0  # TPM 设备映射
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - JAVA_OPTS=-Xmx512m -Xms256m
    restart: unless-stopped
```

---

## 10. 验收标准

### 10.1 功能验收

| # | 验收条件 | 验证方法 |
|---|---------|---------|
| 1 | 用户可以创建账户并分配角色 | 功能测试 |
| 2 | 操作员可以对检测结果进行 ECDSA 签名 | 功能测试 |
| 3 | 签名可被独立验证（不依赖原系统） | 功能测试 |
| 4 | 密钥存储于 TPM 时无法被软件提取 | 安全测试 |
| 5 | 审计日志记录所有签名操作 | 功能测试 |
| 6 | 可导出符合 FDA 21 CFR Part 11 的审计报告 | 文档审查 |
| 7 | Windows 平台 C# 后端正常运行 | 兼容性测试 |
| 8 | Linux ARM 平台 Java 后端正常运行 | 兼容性测试 |
| 9 | 前端在 Vue3 + Ant Design 下正常展示 | UI 测试 |
| 10 | TPM 不可用时系统降级到软件密钥库 | 降级测试 |

### 10.2 性能要求

| 指标 | 要求 | 说明 |
|------|------|------|
| **签名延迟** | < 100ms | 单次签名响应时间 |
| **API 响应** | < 200ms | 95th percentile |
| **并发签名** | ≥ 10 QPS | 峰值签名吞吐 |
| **内存占用** | < 300MB | 后端服务内存 |
| **启动时间** | < 5s | 服务冷启动 |

---

## 11. 后续迭代规划

| 版本 | 方向 | 主要内容 |
|------|------|---------|
| **Phase 3** | M4 安全启动管理器 + M6 合规报告导出 | 启动链验证、PDF 报告生成 |
| **v1.1** | TPM 增强 | PCR 扩展、远程 Attestation |
| **v1.2** | 多设备协同 | Merkle Tree 跨设备同步 |
| **v2.0** | WORM 硬件集成 | 专用 WORM 存储芯片支持 |

---

*文档版本：v2.0*  
*更新日期：2026-07-01*  
*技术负责人：[待定]*  
*状态：Phase 2 技术设计完成，待开发实施*