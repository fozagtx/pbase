import { ethers } from "hardhat";
import { getABI } from "../utils/abi";

async function main(): Promise<void> {
    const contract = await ethers.deployContract('DigitalProductStore');
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log(`DigitalProductStore Contract deployed with address: ${address}`);

    const contractABI = await getABI('DigitalProductStore');

    console.log('Contract ABI:', JSON.stringify(contractABI, null, 2));
    console.log('Deployment complete!');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
