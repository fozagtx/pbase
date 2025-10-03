# DigitalProductStore
A decentralized marketplace for digital products on VeChain. Sell your digital goods and earn VET! 🛍️

## Why I made this 🚀
I wanted to create a truly decentralized marketplace where anyone can sell digital products without gatekeepers or intermediaries. No KYC, no approval process - just connect your wallet and start selling.

The beauty of blockchain is that it enables direct peer-to-peer transactions. Sellers keep 100% of their earnings, and buyers get instant access to their purchases. This is my first VeChain dApp, with more exciting projects to come!

## Tech stack 💻
- **Solidity** for smart contracts
- **Hardhat** for development and deployment
- **VeChain SDK** for blockchain interactions
- **React + Vite** for the frontend
- **Chakra UI** for components and styling
- **TypeScript** for type safety

## Deployment Information 📝
**Contract Name:** DigitalProductStore  
**Network:** VeChain Testnet  
**Contract Address:** `0xdf2a8b836baacb63fc6c1ccd51e7cbecec0df30e`  
**Compiler Version:** Solidity 0.8.20  
**Deployment Date:** October 3, 2025

## How it works 🎯
1. **Connect your wallet** using VeWorld
2. **Add products** with name, download link, and price in VET
3. **Browse products** added by other sellers
4. **Purchase products** - payment goes directly to the seller's balance
5. **Download instantly** - get access to the product link after purchase
6. **Withdraw earnings** - sellers can withdraw their VET earnings anytime

## Key Features ⚡
- **Open marketplace** - Anyone can add and sell products
- **Direct payments** - Sellers receive payments to their account balance
- **Instant delivery** - Download links revealed immediately after purchase
- **Seller dashboard** - Track your balance and manage products
- **No intermediaries** - Truly decentralized, peer-to-peer transactions

## Cloning & running 🏄
Clone the repo:
```bash
git clone <repository-url>
cd pbase
```

Make sure you're using Node.js 20.18.0:
```bash
nvm install 20.18.0
nvm use 20.18.0
```

Install dependencies:
```bash
yarn
```

### Running the contracts
Navigate to contracts folder:
```bash
cd apps/contracts
```

Compile contracts:
```bash
yarn compile
```

Deploy to VeChain testnet:
```bash
yarn deploy-testnet
```

### Running the frontend
Navigate to frontend folder:
```bash
cd apps/frontend
```

Set up environment variables in `.env`:
```
VITE_THOR_URL=https://testnet.vechain.org
```

Run the dev server:
```bash
yarn dev
```

Visit `http://localhost:5173` to see the dApp in action!

## Smart Contract Functions 📋

### addProduct(name, link, price)
Add a new digital product to the marketplace. Available to all users.

### purchaseProduct(productId)
Purchase a product by sending the exact VET amount. Payment is credited to the seller's balance.

### withdrawFunds()
Withdraw your accumulated earnings as a seller.

### getProduct(productId)
View product details. Download link is only visible after purchase.

### deactivateProduct(productId)
Deactivate your product. Only product owner or contract owner can do this.

### sellerBalances(address)
Check any seller's current balance.

### productOwners(productId)
See who owns/created a specific product.

## Bugs & Contributing 🐛
If you find a bug, create an issue with detailed steps to reproduce.

If you want to contribute, make sure an issue is already created and ASSIGNED to you. Don't waste your time making a PR that won't be merged.

If it's something that should be addressed, we can discuss the solution in the GitHub issue, and then you can go ahead and make a PR.

## License
This project is licensed under the MIT License ❤️

---

**About**  
A decentralized marketplace for digital products on VeChain. Anyone can sell, anyone can buy. 🛍️💎
