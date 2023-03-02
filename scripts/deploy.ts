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
    const BaseCreditPoolStorageArtifact = await deployer.loadArtifact('BaseCreditPoolStorage');
  
  
    // Getting the bytecodeHash of the account
  
    const baseCreditPoolStorage = await deployer.deploy(BaseCreditPoolStorageArtifact)
  
    console.log(`baseCreditPoolStorage address: ${baseCreditPoolStorage.address}`);
  }
  const hre = require("hardhat");
  main(hre).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });