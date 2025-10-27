import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import type { CarRatingVault } from "../types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CarRatingVault - End Early", function () {
  let carRating: CarRatingVault;
  let creator: HardhatEthersSigner;
  let other: HardhatEthersSigner;
  let ratingId: bigint;

  beforeEach(async function () {
    await deployments.fixture(["CarRatingVault"]);
    [creator, other] = await ethers.getSigners();
    
    const deployment = await deployments.get("CarRatingVault");
    carRating = await ethers.getContractAt("CarRatingVault", deployment.address, creator) as unknown as CarRatingVault;

    // Create a rating
    const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const tx = await carRating.createRating(
      "Tesla Model 3",
      2024,
      "Test rating",
      ["Performance", "Safety", "Comfort"],
      endTime
    );
    await tx.wait();

    ratingId = await carRating.ratingCounter();
  });

  it("should allow creator to end rating early", async function () {
    const ratingBefore = await carRating.ratings(ratingId);
    const currentBlock = await ethers.provider.getBlock("latest");
    expect(ratingBefore.endTime).to.be.gt(currentBlock!.timestamp);

    // End rating early
    const tx = await carRating.endRatingEarly(ratingId);
    const receipt = await tx.wait();

    const ratingAfter = await carRating.ratings(ratingId);
    const txBlock = await ethers.provider.getBlock(receipt!.blockNumber);
    
    // endTime should be set to the block timestamp when tx was executed
    expect(ratingAfter.endTime).to.equal(txBlock!.timestamp);
    expect(ratingAfter.endTime).to.be.lt(ratingBefore.endTime);
  });

  it("should emit RatingEndedEarly event", async function () {
    const ratingBefore = await carRating.ratings(ratingId);
    const originalEndTime = ratingBefore.endTime;

    await expect(carRating.endRatingEarly(ratingId))
      .to.emit(carRating, "RatingEndedEarly")
      .withArgs(ratingId, creator.address, originalEndTime, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
  });

  it("should not allow non-creator to end rating early", async function () {
    const carRatingAsOther = carRating.connect(other);
    await expect(carRatingAsOther.endRatingEarly(ratingId))
      .to.be.revertedWithCustomError(carRating, "OnlyCreator");
  });

  it("should not allow ending already ended rating", async function () {
    // End it once
    await carRating.endRatingEarly(ratingId);

    // Try to end it again
    await expect(carRating.endRatingEarly(ratingId))
      .to.be.revertedWithCustomError(carRating, "RatingEnded");
  });

  it("should not allow ending non-existent rating", async function () {
    await expect(carRating.endRatingEarly(999))
      .to.be.revertedWithCustomError(carRating, "RatingNotExists");
  });

  it("should allow decryption after ending early", async function () {
    // End rating early
    await carRating.endRatingEarly(ratingId);

    // Should be able to allow decryption immediately
    const tx = await carRating.allowDecryption(ratingId);
    await tx.wait();

    await expect(tx)
      .to.emit(carRating, "ResultsDecrypted")
      .withArgs(ratingId, creator.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp));
  });
});

