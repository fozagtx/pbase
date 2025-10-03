import "@nomicfoundation/hardhat-ethers";
import '@vechain/sdk-hardhat-plugin';
import { HardhatUserConfig, HttpNetworkConfig } from "hardhat/types";

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    vechain_solo: {
      url: 'http://localhost:8669',
      accounts: {
        mnemonic: 'dream later ride misery initial foot hope police motor dose bring soul',
        path: "m/44'/818'/0'/0",
        count: 3,
        initialIndex: 0,
        passphrase: 'vechainthor'
      },
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1,
      timeout: 20000,
      httpHeaders: {}
    } satisfies HttpNetworkConfig,
    vechain_testnet: {
      url: 'https://testnet.vechain.org',
      accounts: {
        mnemonic: 'dream later ride misery initial foot hope police motor dose bring soul',
        path: "m/44'/818'/0'/0",
        count: 3,
        initialIndex: 0,
        passphrase: 'vechainthor'
      },
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1,
      timeout: 20000,
      httpHeaders: {}
    } satisfies HttpNetworkConfig
  },
};

export default config;
