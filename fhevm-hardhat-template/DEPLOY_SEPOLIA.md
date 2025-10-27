# 部署到 Sepolia 测试网

## 📋 准备工作

### 1. 配置环境变量

使用 Hardhat Vault 配置以下变量：

```bash
npx hardhat vars set SEPOLIA_PRIVATE_KEY
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

**需要的信息**：
- `SEPOLIA_PRIVATE_KEY`: 部署账户的私钥（需要 Sepolia ETH）
- `INFURA_API_KEY`: Infura 项目 API 密钥
- `ETHERSCAN_API_KEY`: Etherscan API 密钥（用于合约验证）

### 2. 检查 Sepolia ETH 余额

```bash
npx hardhat --network sepolia accounts
```

确保部署账户有足够的 Sepolia ETH（至少 0.1 ETH）。

## 🚀 部署步骤

### 方式1：使用 Hardhat Deploy

```bash
# 编译合约
npx hardhat compile

# 部署到 Sepolia
npx hardhat deploy --network sepolia

# 验证合约（可选）
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### 方式2：使用硬编码配置

如果需要直接部署（不推荐用于生产），编辑 `hardhat.config.ts` 添加：

```typescript
sepolia: {
  accounts: {
    mnemonic: "your mnemonic here",
  },
  url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
  chainId: 11155111,
},
```

**注意**：不要将私钥或助记词提交到 Git！

## 📝 部署后的操作

1. **记录合约地址**：
   - 部署地址：`deployments/sepolia/CarRatingVault.json`
   - 区块链浏览器：https://sepolia.etherscan.io

2. **更新前端配置**：
   - 更新 `carscorevault-frontend/abi/` 中的合约地址
   - 修改环境变量为 Sepolia 网络

3. **测试合约**：
   - 创建测试评分项目
   - 提交加密评分
   - 验证解密功能

## ⚠️ 安全提醒

- ✅ 使用 Hardhat Vault 存储私钥（安全）
- ❌ 不要硬编码私钥到代码
- ❌ 不要提交 `.env` 文件到 Git
- ✅ 使用测试网进行开发和测试
