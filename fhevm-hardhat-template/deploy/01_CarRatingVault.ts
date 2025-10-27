import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying CarRatingVault to:", hre.network.name);
  console.log("📍 Deployer address:", deployer);

  const deployedCarRatingVault = await deploy("CarRatingVault", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: hre.network.name === "sepolia" ? 3 : 1,
  });

  console.log("✅ CarRatingVault deployed at:", deployedCarRatingVault.address);
  
  if (hre.network.name === "sepolia" && hre.network.config.chainId === 11155111) {
    console.log("🔗 Sepolia Explorer:");
    console.log(`   https://sepolia.etherscan.io/address/${deployedCarRatingVault.address}`);
  }
};

export default func;
func.id = "deploy_CarRatingVault"; // id required to prevent reexecution
func.tags = ["CarRatingVault", "all"];

