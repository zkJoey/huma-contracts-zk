import { utils, Wallet, Provider} from 'zksync-web3';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import dotenv from 'dotenv';
dotenv.config();
import { Web3Provider } from "zksync-web3";
import { ethers } from "ethers";
import {updateInitilizedContract} from "./utils.js";
const BN = require('bn.js');

export default async function main(hre: HardhatRuntimeEnvironment) {

    const privateKey = process.env.PRIVATE_KEY ?? 'null';
    const wallet = new Wallet(privateKey); 
    const provider = new Provider("https://zksync2-testnet.zksync.dev");
    const deployer = new Deployer(hre, wallet);
    //Signers 
    const treasury_wallet = new Wallet(privateKey); 
    const treasury = treasury_wallet.connect(provider);
    const lender_wallet = new Wallet(privateKey);
    const lender = lender_wallet.connect(provider);
    const ea_wallet = new Wallet(privateKey); 
    const ea = ea_wallet.connect(provider);
    const eaService_wallet = new Wallet(privateKey);
    const eaService = eaService_wallet.connect(provider);
    const proxyOwner_wallet = new Wallet(privateKey);
    const proxyOwner = proxyOwner_wallet.connect(provider);
    const pdsService_wallet = new Wallet(privateKey);
    const pdsService = pdsService_wallet.connect(provider);

    // usdc contract 
    const usdcArtifact = await deployer.loadArtifact("TestToken");
    const usdc = await deployer.deploy(usdcArtifact);
    console.log(`usdc address: ${usdc.address}`);

    // evaluation agent 
    const EANFT = await deployer.loadArtifact("EvaluationAgentNFT");
    const EANFTContract = await deployer.deploy(EANFT, []);
    console.log(`evaluationAgentNFT address: ${EANFTContract.address}`)

    // humaConfig 
    const HumaConfig = await deployer.loadArtifact("HumaConfig");
    const HumaConfigContract = await deployer.deploy(HumaConfig, []);
    console.log(`HumaConfig address: ${HumaConfigContract.address}`);

    //Fee manager 
    const BaseCreditPoolFeeManager = await deployer.loadArtifact("BaseFeeManager");
    const BaseCreditPoolFeeManagerContract = await deployer.deploy(BaseCreditPoolFeeManager, []);
    console.log(`BaseCreditPoolFeeManager address: ${BaseCreditPoolFeeManagerContract.address}`);

    //BaseCreditHDTImpl
    const BaseCreditHDTImpl = await deployer.loadArtifact("HDT");
    const BaseCreditHDTImplContract = await deployer.deploy(BaseCreditHDTImpl, []);
    console.log(`BaseCreditHDTImpl address: ${BaseCreditHDTImplContract.address}`);

    //BaseCreditHDT
    const BaseCreditHDT = await deployer.loadArtifact("TransparentUpgradeableProxy");
    const BaseCreditHDTContract = await deployer.deploy(BaseCreditHDT, [BaseCreditHDTImplContract.address, proxyOwner.address, []]);
    console.log(`BaseCreditHDT address: ${BaseCreditHDTContract.address}`);


    //poolConfig 
    const BaseCreditPoolConfig = await deployer.loadArtifact("BasePoolConfig");
    const BaseCreditPoolConfigContract = await deployer.deploy(BaseCreditPoolConfig, []);
    console.log(`BaseCreditPoolConfig address: ${BaseCreditPoolConfigContract.address}`);

    //poolImpl
    const BaseCreditPoolImpl = await deployer.loadArtifact("BaseCreditPool");
    const BaseCreditPoolImplContract = await deployer.deploy(BaseCreditPoolImpl, []);
    console.log(`BaseCreditPoolImpl address: ${BaseCreditPoolImplContract.address}`);

    //poolProxy
    const BaseCreditPool = await deployer.loadArtifact("TransparentUpgradeableProxy");
    const BaseCreditPoolContract = await deployer.deploy(BaseCreditPool, [BaseCreditPoolImplContract.address, proxyOwner.address, []]);
    console.log(`BaseCreditPool address: ${BaseCreditPoolContract.address}`);

    const pool = BaseCreditPoolImplContract.attach(BaseCreditPoolContract.address);
    
    console.log("humaConfig initializing");
    await HumaConfigContract.setHumaTreasury(treasury.address);
    await HumaConfigContract.setTreasuryFee(500);
    await HumaConfigContract.setEANFTContractAddress(EANFTContract.address);
    await HumaConfigContract.setEAServiceAccount(eaService.address);
    await HumaConfigContract.setPDSServiceAccount(pdsService.address);
    await HumaConfigContract.setProtocolDefaultGracePeriod(30*24*3600);
    await HumaConfigContract.setLiquidityAsset(usdc.address, true);
    await updateInitilizedContract("HumaConfig");

    console.log("eaNFT initializing");
    // const ea_address = await ea.getAddress();
    await EANFTContract.connect(ea).mintNFT(ea.address);
    await updateInitilizedContract("EANFT");
    console.log("eaNFT initialized");

    console.log("feeManager initializing");
    await BaseCreditPoolFeeManagerContract.setFees(0,0,0,0,0);
    await updateInitilizedContract("BaseCreditPoolFeeManager");
    console.log("feeManager initialized");

    console.log("HDT initializing");
    const hdt = BaseCreditHDTImplContract.attach(BaseCreditHDTContract.address)
    console.log("HHHHHH");
    await hdt.initialize("Credit HDT", "CHDT", usdc.address);
    console.log("HDT initialized");
    await hdt.setPool(pool.address);
    console.log("HDT initialized again -----");
    await updateInitilizedContract("BaseCreditHDT");
    console.log("HDT initialized --------");

    console.log("Credit pool initializing");
    await BaseCreditPoolConfigContract.initialize("CreditLinePool", hdt.address, HumaConfigContract.address, BaseCreditPoolFeeManagerContract.address);

    const decimals = 6;
    console.log('pause');
    const cap = BN.from(1_000_000).mul(BN.from(10).pow(BN.from(decimals)));
    console.log("cap " + cap);
    await BaseCreditPoolConfigContract.setPoolLiquidity(cap);
    await BaseCreditPoolConfigContract.setPool(pool.address);

    await BaseCreditPoolConfigContract.etPoolOwnerRewardsAndLiquidity(500, 200);
    await BaseCreditPoolConfigContract.setEARewardsAndLiquidity(1000, 100);

    await BaseCreditPoolConfigContract.setEvaluationAgent(1, ea.address);

    const maxCL = BN.from(10_000).mul(BN.from(10).pow(BN.from(decimals)));
    console.log("maxCL: " + maxCL);

    await BaseCreditPoolConfigContract.setMaxCreditLine(maxCL);
    await BaseCreditPoolConfigContract.setAPR(0);
    await BaseCreditPoolConfigContract.setReceivableRequiredInBps(0);
    await BaseCreditPoolConfigContract.setPoolPayPeriod(15);
    await BaseCreditPoolConfigContract.setPoolToken(hdt.address);
    await BaseCreditPoolConfigContract.setWithdrawalLockoutPeriod(0);
    await BaseCreditPoolConfigContract.setPoolDefaultGracePeriod(60);
    await BaseCreditPoolConfigContract.setPoolOwnerTreasury(treasury.address);
    await BaseCreditPoolConfigContract.setCreditApprovalExpiration(5);
    await BaseCreditPoolConfigContract.addPoolOperator(deployer);


    await pool.initialize(BaseCreditPoolConfigContract.address);
    await updateInitilizedContract("BaseCreditPoolConfig");
    await updateInitilizedContract("BaseCreditPool");
    console.log("Credit pool initialized");

    console.log("Enabling pool");
    await pool.addApprovedLender(ea.address);
    await pool.addApprovedLender(treasury);

    const amountOwner = BN.from(20_000).mul(BN.from(10).pow(BN.from(decimals)));
    await usdc.mint(treasury, amountOwner);
    await usdc.connect(treasury).approve(pool.address, amountOwner);
    await pool.connect(treasury).makeInitialDeposit(amountOwner)
    console.log("Enabling pool");
    const amountEA = BN.from(10_000).mul(BN.from(10).pow(BN.from(decimals)));
    await usdc.mint(ea.address, amountEA);
    await usdc.connect(ea).approve(pool.address, amountEA);
    await pool.connect(ea).makeInitialDeposit(amountEA);
    await pool.enablePool();
    console.log("Pool is enabled");

    const amountLender = BN.from(500_000).mul(BN.from(10).pow(BN.from(decimals)));
    await pool.addApprovedLender(lender.address);
    await usdc.mint(lender.address, amountLender);
    await usdc.connect(lender).approve(pool.address, amountLender);
    

}   

const hre = require("hardhat");
  main(hre).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

