#!/bin/bash

# This script deploys contracts to a running Hardhat node

cd ../fhevm-hardhat-template || exit 1

echo "Deploying contracts to Hardhat node..."
npx hardhat deploy --network localhost

echo "Deployment complete!"

