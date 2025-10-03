import * as fs from 'fs';

interface ContractArtifact {
    abi: unknown[];
}

export async function getABI(contractName: string): Promise<unknown[]> {
    try {
        const fileContent = fs.readFileSync(`./artifacts/contracts/${contractName}.sol/${contractName}.json`, 'utf8');
        const contractFile = JSON.parse(fileContent) as ContractArtifact;
        return contractFile.abi;
    } catch (error) {
        console.error(`Error: Unable to find ABI for ${contractName}`);
        console.error(error);
        throw error;
    }
}
