import { utils, Wallet, Provider} from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import dotenv from 'dotenv';
import { SigningKey } from 'ethers/lib/utils';
import {BigNumber} from "ethers";
dotenv.config();
import { Web3Provider } from "zksync-web3";


const HUMA_OWNER_MULTI_SIG = '0xA071F1BC494507aeF4bc5038B8922641c320d486';
const POOL_OWNER_MULTI_SIG = '0x980b09F0CB1a945d29fd45E42cBC046F59cAa7c9';
const dpl = '0x980b09F0CB1a945d29fd45E42cBC046F59cAa7c9';

export default async function main(hre: HardhatRuntimeEnvironment) {

    const privateKey = process.env.PRIVATE_KEY ?? 'null';
    const zkync_goerli_url = process.env.ZK_GOERLI_URL ?? 'null';
    const wallet = new Wallet(privateKey); 
    console.log(wallet);
    const provider = new Provider("https://zksync2-testnet.zksync.dev");
    const walletL2 = wallet.connect(provider);
    const deployer = new Deployer(hre, wallet);


    const usdcArtifact = await deployer.loadArtifact("TestToken");
    const usdc = await deployer.deploy(usdcArtifact);
    console.log(`usdc address: ${usdc.address}`);

    const EANFT = await deployer.loadArtifact("EvaluationAgentNFT");
    const EANFTContract = await deployer.deploy(EANFT, []);
    console.log(`evaluationAgentNFT address: ${EANFTContract.address}`)
    
    // TO REDO after compiing contract
    // const RNNFT = await deployer.loadArtifact("InvoiceNFT");
    // const RNNFTContract = await deployer.deploy(RNNFT, [usdc.address]);
    // console.log(`invoiceNFT address: ${RNNFTContract.address}`);

    const HumaConfig = await deployer.loadArtifact("HumaConfig");
    const HumaConfigContract = await deployer.deploy(HumaConfig);
    console.log(`HumaConfig address: ${HumaConfigContract.address}`);

    const humaConfigTimeLock = await deployer.loadArtifact("TimelockController");
    const humaConfigTimeLockContract = await deployer.deploy(humaConfigTimeLock, [0, [HUMA_OWNER_MULTI_SIG], [dpl], wallet.address]);
    console.log(`humaConfigTimeLock address: ${humaConfigTimeLockContract.address}`);

    const BaseCreditPoolTimelock = await deployer.loadArtifact("TimelockController");
    const BaseCreditPoolTimelockContract = await deployer.deploy(BaseCreditPoolTimelock, [0, [POOL_OWNER_MULTI_SIG], [dpl], wallet.address]);
    console.log(`BaseCreditPoolTimelock address: ${BaseCreditPoolTimelockContract.address}`);

    const BaseCreditPoolProxyAdminTimelock = await deployer.loadArtifact("TimelockController");
    const BaseCreditPoolProxyAdminTimelockContract = await deployer.deploy(BaseCreditPoolProxyAdminTimelock, [0, [POOL_OWNER_MULTI_SIG], [dpl], wallet.address]);
    console.log(`BaseCreditPoolProxyAdminTimelock address: ${BaseCreditPoolProxyAdminTimelockContract.address}`);

    const BaseCreditPoolFeeManager = await deployer.loadArtifact("BaseFeeManager");
    const BaseCreditPoolFeeManagerContract = await deployer.deploy(BaseCreditPoolFeeManager);
    console.log(`BaseCreditPoolFeeManager address: ${BaseCreditPoolFeeManagerContract.address}`);

    const BaseCreditHDTImpl = await deployer.loadArtifact("HDT");
    const BaseCreditHDTImplContract = await deployer.deploy(BaseCreditHDTImpl);
    console.log(`BaseCreditHDTImpl address: ${BaseCreditHDTImplContract.address}`);

    const BaseCreditHDT = await deployer.loadArtifact("TransparentUpgradeableProxy");
    const BaseCreditHDTContract = await deployer.deploy(BaseCreditHDT, [BaseCreditHDTImplContract.address, BaseCreditPoolProxyAdminTimelockContract.address, []]);
    console.log(`BaseCreditHDT address: ${BaseCreditHDTContract.address}`);

    const BaseCreditPoolConfig = await deployer.loadArtifact("BasePoolConfig");
    const BaseCreditPoolConfigContract = await deployer.deploy(BaseCreditPoolConfig);
    console.log(`BaseCreditPoolConfig address: ${BaseCreditPoolConfigContract.address}`);

    const BaseCreditPoolImpl = await deployer.loadArtifact("BaseCreditPool");
    const BaseCreditPoolImplContract = await deployer.deploy(BaseCreditPoolImpl);
    console.log(`BaseCreditPoolImpl address: ${BaseCreditPoolImplContract.address}`);

    const BaseCreditPool = await deployer.loadArtifact("TransparentUpgradeableProxy");
    const BaseCreditPoolContract = await deployer.deploy(BaseCreditPool, [BaseCreditPoolImplContract.address, BaseCreditPoolProxyAdminTimelockContract.address, []]);
    console.log(`BaseCreditPool address: ${BaseCreditPoolContract.address}`);

  }

    // End of deploying base credit pool


  const hre = require("hardhat");
  main(hre).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });