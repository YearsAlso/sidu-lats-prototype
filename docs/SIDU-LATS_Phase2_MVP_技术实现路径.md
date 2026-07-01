# SIDU-LATS Phase 2 MVP 技术实现路径

**文档类型**：技术实现指南  
**版本**：v1.0  
**语言**：中文  
**更新日期**：2026-07-01  
**目标平台**：Windows 工控机（C# .NET 8）+ Linux ARM（Java Spring Boot）

---

## 1. SQLite Schema（WORM 核心表结构）

### 1.1 检测记录主表

```sql
CREATE TABLE detection_records (
    id TEXT PRIMARY KEY,                    -- UUID v4
    batch_id TEXT NOT NULL,                 -- 批次号
    detection_time TEXT NOT NULL,           -- ISO-8601 检测时间
    result_json TEXT NOT NULL,              -- 检测结果 JSON
    result_hash TEXT NOT NULL,              -- SHA-256(result_json)
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING|FROZEN|ARCHIVED|REJECTED|COMPROMISED
    
    -- WORM 关键字段
    frozen_at TEXT,                         -- 冻结时间戳
    frozen_by TEXT,                         -- 冻结操作人
    chain_hash TEXT,                        -- 哈希链当前哈希值
    archived_hash TEXT,                    -- 冻结时保存的哈希（用于后续验证）
    shadow_copy_ref TEXT,                  -- Shadow Copy 引用路径
    
    -- 审计字段
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT NOT NULL
);

CREATE INDEX idx_records_status ON detection_records(status);
CREATE INDEX idx_records_frozen_at ON detection_records(frozen_at);
```

### 1.2 哈希链存储表

```sql
CREATE TABLE hash_chain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sequence INTEGER NOT NULL UNIQUE,      -- 链序列号（从 0 开始）
    record_id TEXT NOT NULL,               -- 关联检测记录 ID
    record_hash TEXT NOT NULL,             -- SHA-256(记录内容)
    previous_hash TEXT NOT NULL,           -- 前一个哈希
    self_hash TEXT NOT NULL,               -- SHA-256(sequence + record_hash + previous_hash)
    merkle_root TEXT,                      -- Merkle 树根哈希
    created_at TEXT NOT NULL
);

CREATE INDEX idx_hash_chain_sequence ON hash_chain(sequence);
```

### 1.3 审计日志表（WORM 独立存储）

```sql
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    level TEXT NOT NULL,                   -- INFO|WARN|ERROR|SECURITY
    action TEXT NOT NULL,                  -- 操作类型
    actor_id TEXT,                         -- 操作人
    target_type TEXT,                      -- 目标实体类型
    target_id TEXT,                        -- 目标实体 ID
    detail TEXT,                           -- JSON 详情
    chain_hash TEXT,                       -- 操作时的链哈希
    integrity_check_hash TEXT             -- 用于完整性验证的哈希
);

CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_action ON audit_log(action);
```

### 1.4 用户表

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                    -- UUID v4
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,                     -- ADMIN|QUALITY_MANAGER|QUALITY_INSPECTOR|AUDITOR|OPERATOR
    department TEXT,
    email TEXT,
    signing_key_id TEXT,                    -- 关联签名密钥
    key_storage_type TEXT NOT NULL,         -- 'TPM' | 'SOFTWARE'
    password_hash TEXT NOT NULL,           -- Argon2id 哈希
    status TEXT NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE|DISABLED
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_user_username ON users(username);
```

### 1.5 签名记录表

```sql
CREATE TABLE signatures (
    id TEXT PRIMARY KEY,                    -- UUID v4
    detection_record_id TEXT NOT NULL,
    signer_id TEXT NOT NULL,
    algorithm TEXT NOT NULL,               -- ECDSA_P256|RSA_2048
    key_id TEXT NOT NULL,                  -- tpm://... 或 sw://...
    meaning TEXT NOT NULL,                  -- 签名含义文本
    signature_value TEXT NOT NULL,          -- Base64 编码签名值
    timestamp TEXT NOT NULL,
    previous_hash TEXT NOT NULL,           -- 前一个签名哈希（链式）
    self_hash TEXT NOT NULL,               -- 本签名哈希
    created_at TEXT NOT NULL,
    FOREIGN KEY (detection_record_id) REFERENCES detection_records(id),
    FOREIGN KEY (signer_id) REFERENCES users(id)
);

CREATE INDEX idx_signature_detect ON signatures(detection_record_id);
CREATE INDEX idx_signature_signer ON signatures(signer_id);
```

### 1.6 WORM 保护触发器（核心）

```sql
-- 阻止修改已冻结/归档记录
CREATE TRIGGER prevent_frozen_update
BEFORE UPDATE ON detection_records
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN OLD.status IN ('FROZEN', 'ARCHIVED') THEN
            RAISE(ABORT, 'WORM 存储拒绝：已冻结记录禁止修改')
    END;
END;

-- 阻止删除已冻结/归档记录
CREATE TRIGGER prevent_frozen_delete
BEFORE DELETE ON detection_records
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN OLD.status IN ('FROZEN', 'ARCHIVED') THEN
            RAISE(ABORT, 'WORM 存储拒绝：已冻结记录禁止删除')
    END;
END;

-- 阻止删除关键状态变更历史
CREATE TRIGGER prevent_audit_delete
BEFORE DELETE ON worm_state_history
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN OLD.to_status IN ('FROZEN', 'ARCHIVED') THEN
            RAISE(ABORT, 'WORM 存储拒绝：关键状态变更历史禁止删除')
    END;
END;
```

---

## 2. C# 代码示例

### 2.1 哈希链服务实现

```csharp
// HashChainService.cs - C# .NET 8 哈希链核心实现

using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.Sqlite;

public class HashChainService
{
    private readonly string _dbPath;
    private const string GENESIS_SEED = "SIDU-LATS-WORM-GENESIS-2026";

    public HashChainService(string dbPath)
    {
        _dbPath = dbPath;
    }

    /// <summary>
    /// 扩展哈希链：追加新记录
    /// </summary>
    public async Task<ChainResult> ExtendAsync(string recordHash)
    {
        await using var db = new SqliteConnection($"Data Source={_dbPath}");
        await db.OpenAsync();

        // 获取链尾
        var lastEntry = await GetLastEntryAsync(db);
        var previousHash = lastEntry?.SelfHash ?? "GENESIS";
        var newSequence = (lastEntry?.Sequence ?? 0) + 1;

        // 计算自哈希：SHA256(sequence|recordHash|previousHash)
        var selfHash = ComputeSelfHash(newSequence, recordHash, previousHash);

        // 插入新条目
        var cmd = db.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO hash_chain (sequence, record_id, record_hash, previous_hash, self_hash, merkle_root, created_at)
            VALUES (@seq, @rid, @rh, @ph, @sh, @mr, @ca)";
        cmd.Parameters.AddWithValue("@seq", newSequence);
        cmd.Parameters.AddWithValue("@rid", Guid.NewGuid().ToString());
        cmd.Parameters.AddWithValue("@rh", recordHash);
        cmd.Parameters.AddWithValue("@ph", previousHash);
        cmd.Parameters.AddWithValue("@sh", selfHash);
        cmd.Parameters.AddWithValue("@mr", ComputeMerkleRoot(db, recordHash));
        cmd.Parameters.AddWithValue("@ca", DateTimeOffset.UtcNow.ToString("O"));
        
        await cmd.ExecuteNonQueryAsync();

        return new ChainResult(selfHash, newSequence);
    }

    /// <summary>
    /// 验证哈希链完整性
    /// </summary>
    public async Task<ChainValidationResult> ValidateAsync()
    {
        await using var db = new SqliteConnection($"Data Source={_dbPath}");
        await db.OpenAsync();

        var cmd = db.CreateCommand();
        cmd.CommandText = "SELECT * FROM hash_chain ORDER BY sequence ASC";
        
        var entries = new List<HashChainEntry>();
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                entries.Add(new HashChainEntry
                {
                    Sequence = reader.GetInt32(1),
                    RecordHash = reader.GetString(3),
                    PreviousHash = reader.GetString(4),
                    SelfHash = reader.GetString(5)
                });
            }
        }

        string expectedPreviousHash = "GENESIS";
        foreach (var entry in entries)
        {
            if (entry.PreviousHash != expectedPreviousHash)
                return ChainValidationResult.Invalid(
                    $"序列 {entry.Sequence} 前序哈希不匹配");

            var computedHash = ComputeSelfHash(entry.Sequence, entry.RecordHash, entry.PreviousHash);
            if (computedHash != entry.SelfHash)
                return ChainValidationResult.Invalid(
                    $"序列 {entry.Sequence} 自哈希验证失败");

            expectedPreviousHash = entry.SelfHash;
        }

        return ChainValidationResult.Valid();
    }

    private string ComputeSelfHash(int sequence, string recordHash, string previousHash)
    {
        var data = $"{sequence}|{recordHash}|{previousHash}";
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(data)));
    }

    private string ComputeMerkleRoot(SqliteConnection db, string newRecordHash)
    {
        // 获取当前所有叶子节点
        var cmd = db.CreateCommand();
        cmd.CommandText = "SELECT record_hash FROM hash_chain";
        var leaves = new List<string>();
        using var reader = cmd.ExecuteReader();
        while (reader.Read()) leaves.Add(reader.GetString(0));
        leaves.Add(newRecordHash);

        return MerkleTree.ComputeRoot(leaves);
    }

    private async Task<HashChainEntry> GetLastEntryAsync(SqliteConnection db)
    {
        var cmd = db.CreateCommand();
        cmd.CommandText = "SELECT * FROM hash_chain ORDER BY sequence DESC LIMIT 1";
        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new HashChainEntry
            {
                Sequence = reader.GetInt32(1),
                SelfHash = reader.GetString(5)
            };
        }
        return null;
    }
}

public class HashChainEntry
{
    public int Sequence { get; set; }
    public string RecordHash { get; set; }
    public string PreviousHash { get; set; }
    public string SelfHash { get; set; }
}

public record ChainResult(string ChainHash, int Sequence);
public record ChainValidationResult(bool IsValid, string ErrorMessage = null)
{
    public static ChainValidationResult Valid() => new(true);
    public static ChainValidationResult Invalid(string error) => new(false, error);
}
```

### 2.2 Merkle Tree 实现

```csharp
// MerkleTree.cs

using System.Security.Cryptography;
using System.Text;

public static class MerkleTree
{
    public static string ComputeRoot(List<string> leaves)
    {
        if (leaves == null || leaves.Count == 0)
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes("EMPTY")))[..64];

        if (leaves.Count == 1)
            return leaves[0];

        var parents = new List<string>();
        for (int i = 0; i < leaves.Count; i += 2)
        {
            var left = leaves[i];
            var right = i + 1 < leaves.Count ? leaves[i + 1] : left; // 奇数时复制自身
            var combined = $"{left}|{right}";
            parents.Add(Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(combined)))[..64]);
        }

        return ComputeRoot(parents);
    }
}
```

### 2.3 WORM 存储服务

```csharp
// WormStorageService.cs - C# .NET 8 WORM 存储核心实现

using System.IO;
using System.Security.Cryptography;
using Microsoft.Data.Sqlite;

public class WormStorageService
{
    private readonly string _dbPath;
    private readonly string _shadowCopyPath;
    private readonly HashChainService _hashChain;

    public WormStorageService(string dbPath, string shadowCopyPath)
    {
        _dbPath = dbPath;
        _shadowCopyPath = shadowCopyPath;
        _hashChain = new HashChainService(dbPath);
    }

    /// <summary>
    /// 冻结检测记录：签名确认后进入 WORM 保护状态
    /// </summary>
    public async Task<FreezeResult> FreezeRecordAsync(Guid recordId, string operatorId)
    {
        await using var db = new SqliteConnection($"Data Source={_dbPath}");
        await db.OpenAsync();

        // 1. 获取记录并验证状态
        var record = await GetRecordAsync(db, recordId);
        if (record.Status != "PENDING")
            throw new WormViolationException(
                $"只有 PENDING 状态的记录可以冻结，当前状态: {record.Status}");

        // 2. 计算记录哈希并扩展哈希链
        var recordHash = ComputeRecordHash(record.ResultJson);
        var chainResult = await _hashChain.ExtendAsync(recordHash);

        // 3. 更新数据库状态（触发器会阻止非 PENDING 状态的修改）
        var updateCmd = db.CreateCommand();
        updateCmd.CommandText = @"
            UPDATE detection_records 
            SET status = 'FROZEN', 
                frozen_at = @fa, 
                frozen_by = @fb, 
                chain_hash = @ch,
                archived_hash = @ah,
                updated_at = @ua
            WHERE id = @id";
        updateCmd.Parameters.AddWithValue("@fa", DateTimeOffset.UtcNow.ToString("O"));
        updateCmd.Parameters.AddWithValue("@fb", operatorId);
        updateCmd.Parameters.AddWithValue("@ch", chainResult.ChainHash);
        updateCmd.Parameters.AddWithValue("@ah", recordHash);
        updateCmd.Parameters.AddWithValue("@ua", DateTimeOffset.UtcNow.ToString("O"));
        updateCmd.Parameters.AddWithValue("@id", recordId.ToString());
        
        await updateCmd.ExecuteNonQueryAsync();

        // 4. 设置文件只读属性
        var recordPath = GetRecordFilePath(recordId);
        SetFileReadOnly(recordPath);

        return new FreezeResult
        {
            RecordId = recordId,
            FrozenAt = DateTimeOffset.UtcNow,
            ChainHash = chainResult.ChainHash
        };
    }

    /// <summary>
    /// 验证记录完整性
    /// </summary>
    public async Task<IntegrityResult> VerifyIntegrityAsync(Guid recordId)
    {
        await using var db = new SqliteConnection($"Data Source={_dbPath}");
        await db.OpenAsync();

        var cmd = db.CreateCommand();
        cmd.CommandText = "SELECT result_json, result_hash, archived_hash, status FROM detection_records WHERE id = @id";
        cmd.Parameters.AddWithValue("@id", recordId.ToString());
        
        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return new IntegrityResult { IsValid = false, Reason = "记录不存在" };

        var currentHash = ComputeRecordHash(reader.GetString(0));
        var storedArchivedHash = reader.GetString(2);
        var status = reader.GetString(3);

        return new IntegrityResult
        {
            IsValid = status == "PENDING" || currentHash == storedArchivedHash,
            ExpectedHash = storedArchivedHash,
            ActualHash = currentHash,
            VerifiedAt = DateTimeOffset.UtcNow
        };
    }

    /// <summary>
    /// 拒绝任何对已冻结记录的修改尝试
    /// </summary>
    public Task WriteRecordAsync(DetectionRecord record)
    {
        if (record.Status == "FROZEN")
            throw new WormViolationException(
                $"记录 {record.Id} 处于 FROZEN 状态，禁止写入。WORM 存储拒绝修改请求。");
        
        // 正常写入逻辑...
        return Task.CompletedTask;
    }

    private void SetFileReadOnly(string filePath)
    {
        var fileInfo = new FileInfo(filePath);
        fileInfo.IsReadOnly = true;

        // ACL 移除写入权限
        var security = fileInfo.GetAccessControl();
        security.SetAccessRuleProtection(isProtected: true, preserveInheritance: false);
        fileInfo.SetAccessControl(security);
    }

    private string ComputeRecordHash(string resultJson)
    {
        return Convert.ToHexString(SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(resultJson)))[..64];
    }

    private static string GetRecordFilePath(Guid recordId) =>
        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data", "records", $"{recordId}.json");
}

public class DetectionRecord
{
    public Guid Id { get; set; }
    public string ResultJson { get; set; }
    public string Status { get; set; }
}

public record FreezeResult(Guid RecordId, DateTimeOffset FrozenAt, string ChainHash);
public record IntegrityResult
{
    public bool IsValid { get; set; }
    public string Reason { get; set; }
    public string ExpectedHash { get; set; }
    public string ActualHash { get; set; }
    public DateTimeOffset VerifiedAt { get; set; }
}

public class WormViolationException : Exception
{
    public WormViolationException(string message) : base(message) { }
}
```

### 2.4 签名服务

```csharp
// SignatureService.cs - C# .NET 8 数字签名实现

using System.Security.Cryptography;

public class SignatureService
{
    private readonly ECDsa _signingKey;
    private readonly string _keyId;
    private readonly bool _useTpm;

    public SignatureService(bool useTpm = true)
    {
        _useTpm = useTpm;
        
        if (useTpm && Tpm2Available())
        {
            // 使用 TPM 存储的密钥
            _signingKey = GetTpmKey(CngAlgorithm.ECDsaP256);
            _keyId = "tpm://ecdsa-p256/sidu-signing";
        }
        else
        {
            // 软件密钥库（受 DPAPI 保护）
            _signingKey = GetOrCreateSoftwareKey();
            _keyId = "sw://ecdsa-p256/sidu-signing";
        }
    }

    /// <summary>
    /// 对检测结果进行数字签名
    /// </summary>
    public SignatureResult Sign(string recordJson, string signerId, string meaning)
    {
        // 1. 计算记录哈希
        var recordHash = ComputeSha256(recordJson);

        // 2. 构造签名数据
        var dataToSign = $"{recordHash}|{signerId}|{meaning}|{DateTimeOffset.UtcNow:O}";

        // 3. 使用 ECDSA P-256 签名
        var signature = _signingKey.SignData(
            System.Text.Encoding.UTF8.GetBytes(dataToSign),
            HashAlgorithmName.SHA256,
            DSASignatureFormat.Rfc3279DerSequence);

        return new SignatureResult
        {
            SignatureValue = Convert.ToBase64String(signature),
            Algorithm = "ECDSA_P256",
            KeyId = _keyId,
            RecordHash = recordHash,
            SignedAt = DateTimeOffset.UtcNow
        };
    }

    /// <summary>
    /// 验证签名
    /// </summary>
    public bool Verify(string dataToSign, string signatureValue, string publicKeyInfo)
    {
        var signatureBytes = Convert.FromBase64String(signatureValue);
        var dataBytes = System.Text.Encoding.UTF8.GetBytes(dataToSign);

        // 从公钥信息重建密钥（简化版）
        using var ecdsa = ECDsa.Create();
        ecdsa.ImportSubjectPublicKeyInfo(Convert.FromBase64String(publicKeyInfo), out _);

        return ecdsa.VerifyData(dataBytes, signatureBytes, HashAlgorithmName.SHA256, 
            DSASignatureFormat.Rfc3279DerSequence);
    }

    private bool Tpm2Available()
    {
        try
        {
            // 检测 TPM 是否可用
            using var tbs = new Microsoft.Win32.Tpm.TbsDevice();
            return tbs.IsPresent();
        }
        catch { return false; }
    }

    private ECDsa GetTpmKey(CngAlgorithm algorithm)
    {
        var keyName = "sidu-signing-key";
        using var key = CngKey.Open(keyName, CngProvider("Microsoft TPM Key Storage Provider"));
        return new ECDsaCng(key);
    }

    private ECDsa GetOrCreateSoftwareKey()
    {
        var keyName = "sidu-software-signing-key";
        try
        {
            using var key = CngKey.Open(keyName);
            return new ECDsaCng(key);
        }
        catch
        {
            // 创建新软件密钥
            var creationParams = new CngKeyCreationParameters
            {
                Provider = CngProvider("Microsoft Software Key Storage Provider"),
                KeyUsage = CngKeyUsages.Signing
            };
            using var key = CngKey.Create(CngAlgorithm.ECDsaP256, keyName, creationParams);
            return new ECDsaCng(key);
        }
    }

    private static string ComputeSha256(string input)
    {
        return Convert.ToHexString(SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(input)))[..64];
    }
}

public record SignatureResult
{
    public string SignatureValue { get; set; }
    public string Algorithm { get; set; }
    public string KeyId { get; set; }
    public string RecordHash { get; set; }
    public DateTimeOffset SignedAt { get; set; }
}
```

---

## 3. 哈希链实现路径

### 3.1 哈希链数据结构

```
┌─────────────────────────────────────────────────────────────┐
│                     哈希链数据结构                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Genesis Block (序列号 = 0)                                   │
│  ├── self_hash = SHA256("0|GENESIS_SEED|GENESIS")           │
│  └── previous_hash = "GENESIS"                               │
│                                                             │
│  Block N (序列号 = N)                                        │
│  ├── sequence = N                                          │
│  ├── record_hash = SHA256(detection_record_json)            │
│  ├── previous_hash = self_hash of Block (N-1)              │
│  ├── self_hash = SHA256("N|record_hash|previous_hash")     │
│  └── merkle_root = Merkle Tree Root of all leaves          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 哈希链验证算法

```csharp
public ChainValidationResult ValidateHashChain()
{
    var entries = LoadAllEntriesFromDatabase(); // 按 sequence ASC 排序
    
    if (entries.Count == 0)
        return ChainValidationResult.Valid();

    // 验证创世块
    var genesis = entries[0];
    if (genesis.Sequence != 0)
        return ChainValidationResult.Invalid("创世块序列号必须为 0");
    
    var expectedGenesisHash = ComputeSelfHash(0, "GENESIS_SEED", "GENESIS");
    if (genesis.SelfHash != expectedGenesisHash)
        return ChainValidationResult.Invalid("创世块哈希验证失败");

    // 验证链连续性
    string expectedPreviousHash = "GENESIS";
    foreach (var entry in entries)
    {
        if (entry.PreviousHash != expectedPreviousHash)
            return ChainValidationResult.Invalid(
                $"序列 {entry.Sequence} 的前序哈希不匹配");

        var computedSelfHash = ComputeSelfHash(
            entry.Sequence, entry.RecordHash, entry.PreviousHash);
        
        if (computedSelfHash != entry.SelfHash)
            return ChainValidationResult.Invalid(
                $"序列 {entry.Sequence} 的自哈希验证失败");

        expectedPreviousHash = entry.SelfHash;
    }

    return ChainValidationResult.Valid();
}

string ComputeSelfHash(int sequence, string recordHash, string previousHash)
{
    var data = $"{sequence}|{recordHash}|{previousHash}";
    return SHA256(data)[..64]; // 取前64字符（256位）
}
```

### 3.3 Merkle Tree 验证

```csharp
// 定期验证 Merkle 树根哈希一致性
public bool VerifyMerkleRoot(int sequence)
{
    var entry = GetHashChainEntry(sequence);
    var allLeaves = GetAllRecordHashesUpTo(sequence);
    
    var computedRoot = MerkleTree.ComputeRoot(allLeaves);
    return computedRoot == entry.MerkleRoot;
}
```

---

## 4. WORM 存储路径

### 4.1 Windows 平台 WORM 实现路径

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Windows WORM 存储路径                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ① 检测记录完成 → 写入 SQLite (PENDING 状态)                                  │
│                                                                             │
│  ② 操作员数字签名确认                                                        │
│       ↓                                                                    │
│  ③ FreezeRecordAsync() 被调用                                               │
│       ├── 计算 record_hash = SHA256(result_json)                            │
│       ├── 扩展哈希链 → 获取 chain_hash                                      │
│       ├── 更新 DB status = 'FROZEN'                                        │
│       ├── 设置 NTFS 只读属性 (fileInfo.IsReadOnly = true)                   │
│       └── 记录 frozen_at, frozen_by, archived_hash                        │
│                                                                             │
│  ④ Shadow Copy 快照（可选，用于高合规场景）                                   │
│       ├── 调用 Windows VSS API 创建快照                                      │
│       └── 复制到只读存储区域                                                 │
│                                                                             │
│  ⑤ 篡改检测定时任务                                                          │
│       ├── 定期验证哈希链完整性                                               │
│       ├── 验证 archived_hash == 当前 record_hash                            │
│       └── 检查 NTFS 权限未被修改                                             │
│                                                                             │
│  ⑥ 任何修改/删除 FROZEN 记录的请求                                           │
│       └── SQLite 触发器 RAISE(ABORT, 'WORM 存储拒绝')                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Linux ARM 平台 WORM 实现路径

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Linux ARM WORM 存储路径                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ① 检测记录完成 → 写入 H2/SQLite (PENDING 状态)                              │
│                                                                             │
│  ② 操作员数字签名确认                                                        │
│       ↓                                                                    │
│  ③ freezeRecord() 被调用                                                    │
│       ├── 计算 record_hash                                                  │
│       ├── 扩展哈希链                                                        │
│       ├── 更新 status = 'FROZEN'                                           │
│       ├── 创建 overlayfs 快照                                               │
│       └── 设置 chattr +i 不可变属性                                         │
│                                                                             │
│  ④ overlayfs 快照创建                                                       │
│       ├── upper/  = 冻结时复制的数据                                         │
│       ├── lower/  = 原始数据引用                                             │
│       └── merged/ = 合并视图（只读）                                         │
│                                                                             │
│  ⑤ dm-verity 块设备校验（可选高合规场景）                                     │
│       └── veritysetup verify                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 WORM 状态机

```
PENDING ───[签名确认]───▶ FROZEN ───[保留期到期]───▶ ARCHIVED
   │                        │                              │
   │                    [篡改检测]                       │
   │                        ↓                              │
   └─────────────────▶ COMPROMISED ◀──────────────────────┘
                          (锁定)
```

| 状态 | 说明 | 允许的操作 |
|------|------|-----------|
| PENDING | 待签名确认 | 读取、编辑、删除（仅限撤回） |
| FROZEN | 已签名，WORM 保护 | 仅读取 |
| ARCHIVED | 超保留期，迁移冷存储 | 仅读取 |
| REJECTED | 签名被拒绝 | 可删除（需审计授权） |
| COMPROMISED | 完整性被破坏 | 锁定，禁止所有操作 |

---

## 5. API 清单

### 5.1 认证相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 用户登录 | 无 |
| POST | `/api/v1/auth/logout` | 用户登出 | JWT |
| POST | `/api/v1/auth/refresh` | 刷新 Token | Refresh Token |

### 5.2 用户管理

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/users` | 获取用户列表 | ADMIN |
| POST | `/api/v1/users` | 创建用户 | ADMIN |
| GET | `/api/v1/users/{id}` | 获取用户详情 | JWT |
| PUT | `/api/v1/users/{id}/status` | 启用/禁用用户 | ADMIN |
| PUT | `/api/v1/users/{id}/password` | 修改密码 | JWT (本人) / ADMIN |

### 5.3 检测记录

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/records` | 创建检测记录 | QUALITY_INSPECTOR+ |
| GET | `/api/v1/records` | 查询检测记录列表 | JWT |
| GET | `/api/v1/records/{id}` | 获取记录详情 | JWT |
| POST | `/api/v1/records/{id}/freeze` | 冻结记录（签名确认） | QUALITY_INSPECTOR+ |
| GET | `/api/v1/records/{id}/integrity` | 验证记录完整性 | JWT |

### 5.4 数字签名

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/signatures` | 对检测结果签名 | QUALITY_* |
| GET | `/api/v1/signatures/{id}` | 获取签名详情 | JWT |
| POST | `/api/v1/signatures/{id}/verify` | 验证签名 | JWT |
| GET | `/api/v1/signatures/record/{recordId}` | 获取记录的签名列表 | JWT |

### 5.5 审计日志

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/audit-logs` | 查询审计日志 | AUDITOR |
| GET | `/api/v1/audit-logs/export` | 导出审计日志 | AUDITOR |
| GET | `/api/v1/audit-logs/chain/verify` | 验证哈希链完整性 | AUDITOR |

### 5.6 密钥管理

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/keys/tpm/availability` | 检查 TPM 可用性 | JWT |
| GET | `/api/v1/keys/my` | 获取当前用户密钥信息 | JWT |
| POST | `/api/v1/keys/regenerate` | 重新生成签名密钥 | ADMIN |

### 5.7 合规报告

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/reports/export` | 导出合规报告 | QUALITY_MANAGER+ |
| GET | `/api/v1/reports/compliance/verify` | 合规性验证 | AUDITOR |
| GET | `/api/v1/reports/worm-status` | WORM 存储状态 | ADMIN |

### 5.8 健康检查

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/health` | 健康检查 | 无 |
| GET | `/api/v1/health/detailed` | 详细健康状态 | ADMIN |

### 5.9 API 响应示例

**签名响应（POST /api/v1/signatures）**：
```json
{
  "signature_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "VALID",
  "algorithm": "ECDSA_P256",
  "key_id": "tpm://ecdsa-p256/sidu-signing",
  "signed_at": "2026-07-01T10:30:00Z",
  "record_hash": "a1b2c3d4...",
  "signature_value": "MEUCIQDp..."
}
```

**哈希链验证响应（GET /api/v1/audit-logs/chain/verify）**：
```json
{
  "is_valid": true,
  "total_entries": 1542,
  "first_sequence": 0,
  "last_sequence": 1542,
  "verified_at": "2026-07-01T10:35:00Z",
  "errors": []
}
```

---

## 6. 部署检查清单

| # | 检查项 | Windows | Linux ARM |
|---|--------|---------|-----------|
| 1 | SQLite 触发器已创建 | ✅ | ✅ |
| 2 | 哈希链 genesis 块已初始化 | ✅ | ✅ |
| 3 | VSS / overlayfs 快照权限 | ✅ | ✅ |
| 4 | NTFS 只读属性 / chattr +i | ✅ | ✅ |
| 5 | TPM 检测脚本验证 | ✅ | ✅ |
| 6 | 篡改检测定时任务配置 | ✅ | ✅ |
| 7 | 合规报告导出功能测试 | ✅ | ✅ |
| 8 | API 认证流程测试 | ✅ | ✅ |

---

*文档版本：v1.0*  
*更新日期：2026-07-01*  
*技术栈：C# .NET 8 / Java Spring Boot / SQLite / Vue3*
