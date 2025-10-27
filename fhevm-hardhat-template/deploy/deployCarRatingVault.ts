import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("CarRatingVault", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`CarRatingVault contract deployed at: ${deployed.address}`);
};

export default func;
func.id = "deploy_car_rating_vault";
func.tags = ["CarRatingVault"];

