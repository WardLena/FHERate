# FHERate - Privacy-Preserving Multi-Dimensional Rating Platform

**FHERate** is a decentralized application (dApp) for privacy-preserving multi-dimensional product ratings built on FHEVM (Fully Homomorphic Encryption Virtual Machine). It enables contributors to submit encrypted scores across multiple dimensions without revealing their input, while allowing creators to decrypt and view aggregated statistics in a secure, decentralized manner.

## 🎯 Core Features

- **🔒 End-to-End Encryption**: Ratings are encrypted on-chain using FHEVM, ensuring complete privacy
- **📊 Multi-Dimensional Analysis**: Rate products across multiple dimensions (quality, price, design, etc.)
- **👥 Decentralized**: No central authority controls the data
- **🔓 Creator-Controlled Decryption**: Only activity creators can decrypt and view aggregated statistics
- **📈 Real-time Analytics**: Visualize rating data with interactive charts and statistics
- **🌐 Cross-Chain Ready**: Deployed on Sepolia testnet with local development support

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity 0.8.27**: Smart contract language
- **Hardhat**: Development environment and deployment framework
- **FHEVM**: Fully Homomorphic Encryption Virtual Machine
- **TypeScript**: Type-safe contract interfaces

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Interactive charting library
- **Ethers.js v6**: Ethereum JavaScript library
- **EIP-6963**: Wallet connection standard

### FHEVM Integration
- **@zama-fhe/relayer-sdk**: Relayer SDK for testnet/mainnet
- **@fhevm/mock-utils**: Mock utilities for local development

## 📁 Project Structure

```
zama_rating_0003/
├── fhevm-hardhat-template/        # Smart contracts
│   ├── contracts/                 # Solidity contracts
│   │   └── FHERatingContract.sol  # Main rating contract
│   ├── deploy/                    # Deployment scripts
│   ├── test/                      # Contract tests
│   └── deployments/               # Deployment artifacts
│       ├── localhost/             # Local deployment
│       └── sepolia/               # Sepolia deployment
├── fherate-frontend/              # Next.js frontend
│   ├── app/                       # Next.js App Router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── create/               # Create activity page
│   │   ├── activity/[id]/       # Rate activity page
│   │   ├── statistics/[id]/      # Statistics & decryption
│   │   ├── my-ratings/           # User's participations
│   │   └── my-creations/          # User's creations
│   ├── components/                # React components
│   ├── hooks/                     # Custom React hooks
│   ├── fhevm/                     # FHEVM integration
│   ├── abi/                       # Generated ABIs & addresses
│   └── scripts/                   # Build scripts
│       ├── genabi.mjs            # ABI generation
│       └── is-hardhat-node-running.mjs
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet
- Hardhat node (for local development)

### Local Development (Mock Mode)

1. **Start Hardhat node** (Terminal 1):
```bash
cd fhevm-hardhat-template
npx hardhat node
```

2. **Deploy contracts** (Terminal 2):
```bash
cd fhevm-hardhat-template
npx hardhat deploy --network localhost
```

3. **Start frontend** (Terminal 3):
```bash
cd fherate-frontend
npm run dev:mock
```

4. **Access the dApp**:
   - Open http://localhost:3000
   - Connect MetaMask to Hardhat Network (Chain ID: 31337)
   - Start using FHERate!

### Testnet Deployment (Sepolia)

1. **Environment Setup**:
```bash
cd fhevm-hardhat-template
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set MNEMONIC
```

2. **Deploy to Sepolia**:
```bash
npx hardhat deploy --network sepolia
```

3. **Generate ABI**:
```bash
cd ../fherate-frontend
npm run genabi
```

4. **Start frontend**:
```bash
npm run dev
```

5. **Connect to Sepolia**:
   - Switch MetaMask to Sepolia testnet
   - Connect wallet and start using

## 📝 Contract Details

### FHERatingContract

**Deployed Addresses**:
- **Sepolia**: `0xDC86C4fed3B25d5C5161A61EbD80F7DE75c52fd6`
- **Localhost**: Auto-generated on each deployment

**Key Functions**:
- `createActivity()`: Create a new rating activity
- `submitRating()`: Submit encrypted ratings
- `getActivity()`: Get activity details
- `getAllRatings()`: Get all ratings (creator only)
- `closeActivity()`: Close an activity (creator only)
- `getCreatorActivities()`: Get user's created activities
- `getParticipantActivities()`: Get user's participated activities

## 🔐 How It Works

### 1. **Encrypted Rating Submission**
```typescript
// User rates a product
const scores = [8, 7, 9]; // Quality, Price, Design
const encrypted = await fhevmInstance.createEncryptedInput(contract, user)
  .add32(scores[0])
  .add32(scores[1])
  .add32(scores[2])
  .encrypt();

await contract.submitRating(activityId, encrypted.handles, encrypted.inputProof);
```

### 2. **Decryption (Creator Only)**
```typescript
// Generate decryption signature
const sig = await FhevmDecryptionSignature.loadOrSign(
  fhevmInstance, [contractAddress], signer, storage
);

// Decrypt ratings
const decryptedValues = await fhevmInstance.userDecrypt(
  handlesToDecrypt, sig.privateKey, sig.publicKey, sig.signature, ...
);

// Calculate statistics
const statistics = calculateStats(decryptedValues);
```

### 3. **Visualization**
- Bar charts showing average scores by dimension
- Radar charts for multi-dimensional analysis
- Detailed statistics and distributions
- Raw data tables

## 🧪 Testing

### Run Contract Tests

```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Run Frontend Build

```bash
cd fherate-frontend
npm run build
```

## 📊 Sample Usage

### Creating an Activity

1. Navigate to `/create`
2. Fill in:
   - Title: "iPhone 15 Review"
   - Dimensions: ["Camera", "Battery", "Display", "Price"]
   - Scale: 10
   - End Time: Future date
3. Submit and receive Activity ID

### Rating an Activity

1. Browse activities at `/browse`
2. Click on an activity
3. Use sliders to rate each dimension
4. Submit encrypted ratings

### Viewing Statistics

1. Go to `/my-creations`
2. Click "Statistics" on your activity
3. Click "🔓 Decrypt & View Statistics"
4. Sign the decryption request
5. View charts and analytics

## 🔗 Links

- **Sepolia Contract**: [SepoliaScan](https://sepolia.etherscan.io/address/0xDC86C4fed3B25d5C5161A61EbD80F7DE75c52fd6)
- **FHEVM Docs**: [FHEVM Documentation](https://docs.zama.ai/fhevm)
- **Hardhat Docs**: [Hardhat Documentation](https://hardhat.org)

## 📄 License

MIT

## 👥 Contributors

- WardLena (gumingyu406@gmail.com)

## 🙏 Acknowledgments

- [Zama.ai](https://zama.ai) for FHEVM
- [Hardhat](https://hardhat.org) for the development framework
- The open-source community

---

**Built with ❤️ using FHEVM**

