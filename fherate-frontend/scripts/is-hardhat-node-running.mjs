import { JsonRpcProvider } from "ethers";

const line =
  "\n===================================================================\n";

async function checkHardhatNode() {
  try {
    const provider = new JsonRpcProvider("http://127.0.0.1:8545");
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    
    if (chainId !== 31337n) {
      console.error(
        `${line}ERROR: Expected Hardhat node (chainId 31337) but got chainId ${chainId}${line}`
      );
      process.exit(1);
    }
    
    console.log("✓ Hardhat node is running on localhost:8545");
    provider.destroy();
  } catch (error) {
    console.error(
      `${line}ERROR: Hardhat node is not running!\n\nPlease start Hardhat node first:\n\n  cd ../fhevm-hardhat-template\n  npx hardhat node\n${line}`
    );
    process.exit(1);
  }
}

checkHardhatNode();

