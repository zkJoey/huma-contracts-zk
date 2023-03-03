import { utils, Wallet, Provider} from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import dotenv from 'dotenv';
import { SigningKey } from 'ethers/lib/utils';
import {BigNumber} from "ethers";
dotenv.config();
import { Web3Provider } from "zksync-web3";


export default async function main(hre: HardhatRuntimeEnvironment) {

    const privateKey = process.env.PRIVATE_KEY ?? 'null';
    const wallet = new Wallet(privateKey); 
    console.log(wallet);
    const provider = new Provider("https://zksync2-testnet.zksync.dev");
    const walletL2 = wallet.connect(provider);
    const deployer = new Deployer(hre, wallet);

    


}

const hre = require("hardhat");
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});