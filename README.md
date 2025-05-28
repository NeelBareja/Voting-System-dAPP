# Decentralized Voting System

A modern, secure blockchain-based voting application built with Next.js, TypeScript, and ethers.js. This DApp allows users to participate in transparent, tamper-proof elections on the Ethereum blockchain.

Visit: [here](https://voting-system-d-app.vercel.app/)

![Voting DApp Screenshot](https://github.com/NeelBareja/Voting-System-dAPP/blob/main/Voting%20System%20Dapp.png)

## 🌟 Features

- **🔐 Secure Voting**: One vote per Ethereum address
- **👑 Owner Controls**: Only contract owner can add candidates
- **🔌 Wallet Management**: Connect and disconnect wallet functionality
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔄 Real-time Results**: Live vote counting and percentage display
- **🔤 Case Insensitive**: Automatic lowercase conversion for consistency
- **🦊 MetaMask Integration**: Seamless wallet connection
- **⚡ Fast Transactions**: Optimized for Ethereum networks
- **🎨 Modern UI**: Clean interface with shadcn/ui components

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Blockchain**: Solidity ^0.8.26, Ethereum
- **Web3 Library**: ethers.js v6
- **UI Components**: shadcn/ui
- **Wallet**: MetaMask integration
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

### Blockchain Requirements:
- Ethereum testnet ETH (for testing)
- Access to an Ethereum RPC provider (Infura, Alchemy, or local node)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/voting-dapp.git
cd voting-dapp
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Deploy the Smart Contract

#### Option A: Using Remix IDE (Recommended for beginners)

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create a new file \`VotingSystemBytes32.sol\`
3. Copy and paste the contract code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract VotingSystemBytes32 {
    bytes32[] public candidates;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can add candidates.");
        _;
    }

    mapping(bytes32 => uint256) private totalVotes;
    mapping(bytes32 => bool) private isCandidate;
    mapping(address => bool) private hasVoted;

    event CandidateAdded(bytes32 candidateId);
    event VoteCast(address indexed voter, bytes32 candidateId);

    function addCandidate(bytes32 _candidateId) public onlyOwner {
        require(!isCandidate[_candidateId], "Candidate already added.");
        candidates.push(_candidateId);
        isCandidate[_candidateId] = true;
        emit CandidateAdded(_candidateId);
    }

    function castVoteFor(bytes32 _candidateId) public {
        require(isCandidate[_candidateId], "Invalid candidate.");
        require(!hasVoted[msg.sender], "You can vote only once.");

        hasVoted[msg.sender] = true;
        totalVotes[_candidateId]++;
        emit VoteCast(msg.sender, _candidateId);
    }

    function voteCountOf(bytes32 _candidateId) public view returns (uint256) {
        return totalVotes[_candidateId];
    }

    function getCandidates() public view returns (bytes32[] memory) {
        return candidates;
    }

    function totalCandidates() public view returns (uint256) {
        return candidates.length;
    }
}
```

4. Compile the contract (Solidity version 0.8.26)
5. Deploy to your preferred network (Sepolia testnet recommended)
6. Copy the deployed contract address

#### Option B: Using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Follow the Hardhat deployment guide and deploy to your preferred network.

### 4. Configure the Contract Address

1. Open \`app/page.tsx\`
2. Replace the \`CONTRACT_ADDRESS\` with your deployed contract address:

```typescript
const CONTRACT_ADDRESS = "0xYourContractAddressHere"
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables (Optional)

Create a \`.env.local\` file for additional configuration:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Network Configuration

The app works with any Ethereum-compatible network. Popular choices:

- **Mainnet**: Ethereum mainnet (requires real ETH)
- **Sepolia**: Ethereum testnet (free test ETH)
- **Polygon**: Lower gas fees
- **Local**: Hardhat/Ganache local development

## 📖 Usage Guide

### For Voters

1. **Connect Wallet**: Click "Connect MetaMask" and approve the connection
2. **View Candidates**: See all available candidates and their vote counts
3. **Cast Vote**: Select a candidate and click "Vote" (one vote per address)
4. **View Results**: See real-time results with percentages and rankings
5. **Disconnect**: Use the "Disconnect" button to disconnect your wallet when done

### For Contract Owner

1. **Connect as Owner**: Connect with the wallet that deployed the contract
2. **Add Candidates**: Use the "Add New Candidate" form (names converted to lowercase)
3. **Monitor Voting**: Watch real-time vote counts and results

## 🏗️ Project Structure

```
voting-dapp/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main voting interface
├── components/
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── badge.tsx
│       └── alert.tsx
├── hooks/
│   └── use-toast.ts         # Toast notifications
├── lib/
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
├── contracts/               # Smart contract files
│   └── VotingSystemBytes32.sol
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔍 Key Components Explained

### Provider Usage (ethers.js v6)

The app uses \`ethers.BrowserProvider\` for blockchain interaction:

```typescript
// Connect to MetaMask
const provider = new ethers.BrowserProvider(window.ethereum)

// Get signer for transactions
const signer = await provider.getSigner()

// Create contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
```

### Bytes32 Conversion

Candidate names are converted to bytes32 for efficient storage:

```typescript
// Convert string to bytes32 (lowercase)
const stringToBytes32 = (str: string): string => {
  return ethers.encodeBytes32String(str.toLowerCase())
}

// Convert bytes32 back to string
const bytes32ToString = (bytes32: string): string => {
  return ethers.decodeBytes32String(bytes32)
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wallet connection works
- [ ] Owner can add candidates
- [ ] Non-owners cannot add candidates
- [ ] Users can vote for valid candidates
- [ ] Users cannot vote twice
- [ ] Vote counts update correctly
- [ ] Results display properly
- [ ] Lowercase conversion works

### Test Networks

Use these faucets to get test ETH:

- **Sepolia**: [Sepolia Faucet](https://sepoliafaucet.com/)
- **Goerli**: [Goerli Faucet](https://goerlifaucet.com/)

## 🚨 Troubleshooting

### Common Issues

#### "MetaMask not found"
- Install MetaMask browser extension
- Refresh the page after installation

#### "Failed to connect wallet"
- Check if MetaMask is unlocked
- Ensure you're on the correct network
- Try refreshing the page

#### "Transaction failed"
- Check if you have enough ETH for gas fees
- Verify the contract address is correct
- Ensure you haven't already voted (if voting)

#### "Only the owner can add candidates"
- Verify you're connected with the wallet that deployed the contract
- Check the contract owner address

### Network Issues

If transactions are slow or failing:

1. Check network congestion
2. Increase gas price in MetaMask
3. Switch to a testnet for development

## 🔒 Security Considerations

- **One Vote Per Address**: Enforced by smart contract
- **Owner Privileges**: Only contract deployer can add candidates
- **Input Validation**: All inputs are validated before blockchain interaction
- **Error Handling**: Comprehensive error messages for failed transactions

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `out` folder to Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [ethers.js](https://ethers.org/) - Ethereum library
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/NeelBareja/Voting-System-dAPP/issues) page
2. Create a new issue with detailed information
---

**Happy Voting! 🗳️**
