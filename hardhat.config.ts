import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import "@matterlabs/hardhat-zksync-verify";


import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
    zksolc: {
        version: '1.3.5',
        compilerSource: 'binary',
        settings: {
            isSystem: true,
        }
    },
    networks: {
      zkTestnet: {
        url: "https://zksync2-testnet.zksync.dev", // URL of the zkSync network RPC
        ethNetwork: "goerli", // URL of the Ethereum Web3 RPC, or the identifier of the network (e.g. `mainnet` or `goerli`)
        zksync: true,
        verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification',
      }
    },
    solidity: {
        version: '0.8.17',
    },
};

export default config;