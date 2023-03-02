import { utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import dotenv from 'dotenv';
import { SigningKey } from 'ethers/lib/utils';
dotenv.config();


export default async function main(hre: HardhatRuntimeEnvironment) {

    const privateKey = process.env.PRIVATE_KEY ?? 'null';
    const wallet = new Wallet(privateKey);
    console.log(wallet);
    const deployer = new Deployer(hre, wallet);

    // //BaseCreditPoolStorage DONE 
    // const BaseCreditPoolStorageArtifact = await deployer.loadArtifact('BaseCreditPoolStorage');
    // const baseCreditPoolStorage = await deployer.deploy(BaseCreditPoolStorageArtifact)
    // console.log(`baseCreditPoolStorage address: ${baseCreditPoolStorage.address}`);

    //BaseCreditPool  DONE 0x711825ECF0cAE46A4D8dA3c9597e3bAACA6C371d
    // const BaseCreditPoolArtifact = await deployer.loadArtifact('BaseCreditPool');
    // const baseCreditPool = await deployer.deploy(BaseCreditPoolArtifact);
    // console.log(`baseCreditPool address: ${baseCreditPool.address}`);

    //BaseFeeManager  DONE 0x4b3Be52DB056a9F5Fc51eAc7bC383Adf3E462524
    // const BaseFeeManagerArtifact = await deployer.loadArtifact('BaseFeeManager');
    // const baseFeeManager = await deployer.deploy(BaseFeeManagerArtifact);
    // console.log(`baseFeeManager address: ${baseFeeManager.address}`);

    //BasePoolConfig 0xbe41E893aC26395d2fd8D871EC6020aDfD465bd8 
    // const BasePoolConfigArtifact = await deployer.loadArtifact('BasePoolConfig');
    // const basePoolConfig = await deployer.deploy(BasePoolConfigArtifact);
    // console.log(`basePoolConfig address: ${basePoolConfig.address}`);

    // BasePool 
    const BasePoolArtifact = await deployer.loadArtifact('BasePool');
    const basePool = await deployer.deploy(BasePoolArtifact);
    console.log(`basePool address: ${basePool.address}`);

    //Errors 0x8aFAF99a942e6EE44bC45cf41a19D0888d6c7ca9
    // const ErrorsArtifact = await deployer.loadArtifact('Errors');
    // const errors = await deployer.deploy(ErrorsArtifact);
    // console.log(`errors address: ${errors.address}`);

    //HumaConfig 0xC56c8545e3f6393bEec41AFFA42f73D4e9ac0CA6
    // const protocolFee = 100;
    // const period = 60;
    // const HumaConfigArtifact = await deployer.loadArtifact('HumaConfig');
    // const humaConfig = await deployer.deploy(HumaConfigArtifact);
    // console.log(`humaConfig address: ${humaConfig.address}`);

    //ReceivableFactoringPool 0xbA5E1a50ce5dD727c5B5A98C5Dd098A87BC64e8F
    // const ReceivableFactoringPoolArtifact = await deployer.loadArtifact('ReceivableFactoringPool');
    // const receivableFactoringPool = await deployer.deploy(ReceivableFactoringPoolArtifact);
    // console.log(`receivableFactoringPool address: ${receivableFactoringPool.address}`);









  }


  const hre = require("hardhat");
  main(hre).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });