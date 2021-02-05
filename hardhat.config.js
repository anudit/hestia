require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-abi-exporter');
require('hardhat-contract-sizer');
// require("hardhat-gas-reporter");
require('dotenv').config()

let mnemonic = process.env.MNEMONIC;

const infuraNetwork = (network, chainId, gas) => {
  return {
    url: `https://${network}.infura.io/v3/${process.env.PROJECT_ID}`,
    chainId,
    gas,
    accounts: mnemonic ? { mnemonic } : undefined
  };
};

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            runs: 999999,
            enabled: true
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      saveDeployments: true,
      accounts: mnemonic ? { mnemonic } : undefined
    },
    rinkeby: infuraNetwork("rinkeby", 4, 6283185),
    kovan: infuraNetwork("kovan", 42, 6283185),
    goerli: infuraNetwork("goerli", 5, 6283185),
    matic: {
      url: "https://rpc-mumbai.maticvigil.com/v1/36aed576f085dcef42748c474a02b1c51db45c86",
      chainId: 80001,
      accounts: mnemonic ? { mnemonic } : undefined
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: mnemonic ? { mnemonic } : undefined
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY ? process.env.ETHERSCAN_API_KEY : undefined
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 1,
    coinmarketcap: process.env.CMC_APIKEY
  },
  abiExporter: {
    path: './abi',
    clear: true,
    flat: true,
    only: ['HestiaSuperApp', 'HestiaCreator', 'Dai'],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  }
};

