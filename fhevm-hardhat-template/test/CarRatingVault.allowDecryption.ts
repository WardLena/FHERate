import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import type { CarRatingVault } from "../types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CarRatingVault - Allow Decryption", function () {
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
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock!.timestamp + 3600; // 1 hour from now
    const tx = await carRating.createRating(
      "Tesla Model 3",
      2024,
      "Test rating",
      ["Performance", "Safety", "Comfort"],
      endTime
    );
    await tx.wait();

    ratingId = await carRating.ratingCounter();

    // Fast forward time to end the rating
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine", []);
  });

  it("should set resultsDecrypted to true after allowDecryption", async function () {
    // Check initial state
    const ratingBefore = await carRating.ratings(ratingId);
    expect(ratingBefore.resultsDecrypted).to.be.false;

    // Allow decryption
    const tx = await carRating.allowDecryption(ratingId);
    await tx.wait();

    // Check state after
    const ratingAfter = await carRating.ratings(ratingId);
    expect(ratingAfter.resultsDecrypted).to.be.true;
  });

  it("should emit ResultsDecrypted event", async function () {
    await expect(carRating.allowDecryption(ratingId))
      .to.emit(carRating, "ResultsDecrypted")
      .withArgs(ratingId, creator.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
  });

  it("should return resultsDecrypted in getRating", async function () {
    // Before allowDecryption
    let rating = await carRating.getRating(ratingId);
    expect(rating.resultsDecrypted).to.be.false;

    // After allowDecryption
    await carRating.allowDecryption(ratingId);
    rating = await carRating.getRating(ratingId);
    expect(rating.resultsDecrypted).to.be.true;
  });

  it("should not allow non-creator to decrypt", async function () {
    const carRatingAsOther = carRating.connect(other);
    await expect(carRatingAsOther.allowDecryption(ratingId))
      .to.be.revertedWithCustomError(carRating, "OnlyCreator");
  });

  it("should not allow decryption before rating ends", async function () {
    // Create a new rating that hasn't ended yet
    const currentBlock = await ethers.provider.getBlock("latest");
    const futureEndTime = currentBlock!.timestamp + 3600; // 1 hour from now
    const tx = await carRating.createRating(
      "BMW X5",
      2024,
      "Future rating",
      ["Performance"],
      futureEndTime
    );
    await tx.wait();

    const newRatingId = await carRating.ratingCounter();

    await expect(carRating.allowDecryption(newRatingId))
      .to.be.revertedWithCustomError(carRating, "RatingNotEnded");
  });
});

