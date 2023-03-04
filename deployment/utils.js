const fs = require("fs");
const {BigNumber: BN, ethers} = require("ethers");
const DEPLOYED_PATH = "./deployment/";


const readFileContent = async function (fileType = "deployed", network) {
    const contractAddressFile = await getContractAddressFile(fileType, network);
    const data = fs.readFileSync(contractAddressFile, {flag: "a+"});
    const content = data.toString();
    if (content.length == 0) {
        return "{}";
    }
    return content;
};

const getContractAddressFile = async function (fileType = "deployed", network) {
    if (!network) {
        network = "zkTestnet";
    }
    const contractAddressFile = `${DEPLOYED_PATH}${network}-${fileType}-contracts.json`;
    // console.log("contractAddressFile: ", contractAddressFile);
    return contractAddressFile;
};

async function updateContract(type, contractName, value) {
    const oldData = await readFileContent(type);
    let contracts = JSON.parse(oldData);
    contracts[contractName] = value;
    const newData = JSON.stringify(contracts).replace(/\,/g, ",\n");
    const deployedContractsFile = await getContractAddressFile(type);
    fs.writeFileSync(deployedContractsFile, newData);
}


const updateInitilizedContract = async function (contractName) {
    await updateContract("initialized", contractName, "Done");
};



module.exports = {
    updateInitilizedContract
}