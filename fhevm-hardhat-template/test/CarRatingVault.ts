import { expect } from "chai";
import { ethers, deployments, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { CarRatingVault } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
};

describe("CarRatingVault", function () {
  let signers: Signers;
  let carRatingVault: CarRatingVault;
  let contractAddress: string;

  before(async function () {
    // Check if running on mock environment
    if (!fhevm.isMock) {
      console.warn(`This test suite can only run on mock environment`);
      this.skip();
    }

    await deployments.fixture(["CarRatingVault"]);

    const signersArray = await ethers.getSigners();
    signers = {
      alice: signersArray[0],
      bob: signersArray[1],
      carol: signersArray[2],
    };

    const deployment = await deployments.get("CarRatingVault");
    contractAddress = deployment.address;
    carRatingVault = await ethers.getContractAt("CarRatingVault", contractAddress);
  });

  describe("创建评分", function () {
    it("应该成功创建评分项目", async function () {
      const carModel = "Tesla Model 3";
      const carYear = 2024;
      const description = "Performance electric sedan";
      const dimensions = ["Performance", "Comfort", "Safety", "Design"];
      const endTime = Math.floor(Date.now() / 1000) + 86400; // 24小时后

      const tx = await carRatingVault
        .connect(signers.alice)
        .createRating(carModel, carYear, description, dimensions, endTime);

      await expect(tx)
        .to.emit(carRatingVault, "RatingCreated")
        .withArgs(1, signers.alice.address, carModel, carYear, endTime);

      const rating = await carRatingVault.getRating(1);
      expect(rating.id).to.equal(1);
      expect(rating.creator).to.equal(signers.alice.address);
      expect(rating.carModel).to.equal(carModel);
      expect(rating.carYear).to.equal(carYear);
      expect(rating.dimensions.length).to.equal(4);
      expect(rating.participantCount).to.equal(0);
    });

    it("应该拒绝过期的结束时间", async function () {
      const endTime = Math.floor(Date.now() / 1000) - 100; // 过去的时间
      
      await expect(
        carRatingVault
          .connect(signers.alice)
          .createRating("Test Car", 2024, "Test", ["Performance"], endTime)
      ).to.be.revertedWithCustomError(carRatingVault, "InvalidEndTime");
    });

    it("应该拒绝空的维度列表", async function () {
      const endTime = Math.floor(Date.now() / 1000) + 86400;
      
      await expect(
        carRatingVault
          .connect(signers.alice)
          .createRating("Test Car", 2024, "Test", [], endTime)
      ).to.be.revertedWithCustomError(carRatingVault, "EmptyDimensions");
    });
  });

  describe("提交评分", function () {
    let ratingId: number;

    before(async function () {
      // 创建评分项目
      const carModel = "BMW M3";
      const carYear = 2024;
      const description = "Sports sedan";
      const dimensions = ["Performance", "Comfort", "Safety"];
      const endTime = Math.floor(Date.now() / 1000) + 86400;

      const tx = await carRatingVault
        .connect(signers.alice)
        .createRating(carModel, carYear, description, dimensions, endTime);

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "RatingCreated"
      );
      ratingId = event ? Number(event.args[0]) : 2;
    });

    it("应该成功提交加密评分", async function () {
      // 创建加密输入
      const input = await fhevm.createEncryptedInput(contractAddress, signers.bob.address);
      input.add8(8); // Performance: 8
      input.add8(7); // Comfort: 7
      input.add8(9); // Safety: 9
      const encryptedInput = await input.encrypt();

      const tx = await carRatingVault
        .connect(signers.bob)
        .submitRating(
          ratingId,
          [encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.handles[2]],
          encryptedInput.inputProof
        );

      await expect(tx).to.emit(carRatingVault, "RatingSubmitted");

      const rating = await carRatingVault.getRating(ratingId);
      expect(rating.participantCount).to.equal(1);

      const hasParticipated = await carRatingVault.getUserParticipated(
        ratingId,
        signers.bob.address
      );
      expect(hasParticipated).to.be.true;
    });

    it("应该允许多个用户提交评分", async function () {
      const input = await fhevm.createEncryptedInput(contractAddress, signers.carol.address);
      input.add8(9); // Performance: 9
      input.add8(8); // Comfort: 8
      input.add8(10); // Safety: 10
      const encryptedInput = await input.encrypt();

      await carRatingVault
        .connect(signers.carol)
        .submitRating(
          ratingId,
          [encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.handles[2]],
          encryptedInput.inputProof
        );

      const rating = await carRatingVault.getRating(ratingId);
      expect(rating.participantCount).to.equal(2);
    });

    it("应该拒绝重复提交", async function () {
      const input = await fhevm.createEncryptedInput(contractAddress, signers.bob.address);
      input.add8(5);
      input.add8(5);
      input.add8(5);
      const encryptedInput = await input.encrypt();

      await expect(
        carRatingVault
          .connect(signers.bob)
          .submitRating(
            ratingId,
            [encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.handles[2]],
            encryptedInput.inputProof
          )
      ).to.be.revertedWithCustomError(carRatingVault, "AlreadyParticipated");
    });

    it("应该拒绝维度数量不匹配的评分", async function () {
      const input = await fhevm.createEncryptedInput(contractAddress, signers.alice.address);
      input.add8(8);
      input.add8(7); // 只有2个维度，但需要3个
      const encryptedInput = await input.encrypt();

      await expect(
        carRatingVault
          .connect(signers.alice)
          .submitRating(
            ratingId,
            [encryptedInput.handles[0], encryptedInput.handles[1]],
            encryptedInput.inputProof
          )
      ).to.be.revertedWithCustomError(carRatingVault, "DimensionMismatch");
    });
  });

  describe("授权解密", function () {
    let ratingId: number;
    let endTime: number;

    before(async function () {
      // 创建一个短期评分项目（使用最新区块时间戳 + 2秒）
      const carModel = "Audi A4";
      const carYear = 2024;
      const description = "Luxury sedan";
      const dimensions = ["Performance", "Comfort"];
      const latestBlock = await ethers.provider.getBlock("latest");
      endTime = (latestBlock?.timestamp || 0) + 2;

      const tx = await carRatingVault
        .connect(signers.alice)
        .createRating(carModel, carYear, description, dimensions, endTime);

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "RatingCreated"
      );
      ratingId = event ? Number(event.args[0]) : 3;

      // Bob 提交评分
      const input = await fhevm.createEncryptedInput(contractAddress, signers.bob.address);
      input.add8(7);
      input.add8(8);
      const encryptedInput = await input.encrypt();

      await carRatingVault
        .connect(signers.bob)
        .submitRating(
          ratingId,
          [encryptedInput.handles[0], encryptedInput.handles[1]],
          encryptedInput.inputProof
        );

      // 增加区块时间（模拟时间流逝）
      await ethers.provider.send("evm_increaseTime", [3]);
      await ethers.provider.send("evm_mine", []);
    });

    it("应该允许创建者授权解密", async function () {
      const tx = await carRatingVault
        .connect(signers.alice)
        .allowDecryption(ratingId);

      await expect(tx).to.emit(carRatingVault, "ResultsDecrypted");
    });

    it("应该拒绝非创建者授权解密", async function () {
      // 使用已经过期的 ratingId 测试
      await expect(
        carRatingVault.connect(signers.bob).allowDecryption(ratingId)
      ).to.be.revertedWithCustomError(carRatingVault, "OnlyCreator");
    });
  });

  describe("查询方法", function () {
    it("应该返回正确的评分数量", async function () {
      const count = await carRatingVault.getRatingCount();
      expect(count).to.be.gte(3);
    });

    it("应该返回用户创建的评分列表", async function () {
      const creations = await carRatingVault.getUserCreations(signers.alice.address);
      expect(creations.length).to.be.gte(3);
    });

    it("应该返回用户参与的评分列表", async function () {
      const participations = await carRatingVault.getUserParticipations(signers.bob.address);
      expect(participations.length).to.be.gte(2);
    });

    it("应该批量获取评分项目", async function () {
      const ratings = await carRatingVault.getRatings(1, 5);
      expect(ratings.length).to.be.lte(5);
    });
  });

  describe("获取加密结果", function () {
    let ratingId: number;

    before(async function () {
      const tx = await carRatingVault
        .connect(signers.alice)
        .createRating(
          "Test Car",
          2024,
          "Test",
          ["Dimension1"],
          Math.floor(Date.now() / 1000) + 86400
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "RatingCreated"
      );
      ratingId = event ? Number(event.args[0]) : 5;
    });

    it("应该返回加密的结果句柄", async function () {
      const results = await carRatingVault.getEncryptedResults(ratingId);
      expect(results.dimensionSums.length).to.equal(1);
      expect(results.participantCount).to.not.be.undefined;
    });
  });

  describe("解密测试", function () {
    let ratingId: number;

    before(async function () {
      // 创建评分
      const latestBlock = await ethers.provider.getBlock("latest");
      const endTime = (latestBlock?.timestamp || 0) + 100; // 更长的时间避免立即过期
      const tx = await carRatingVault
        .connect(signers.alice)
        .createRating("Decrypt Test", 2024, "Test", ["Performance"], endTime);

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "RatingCreated"
      );
      ratingId = event ? Number(event.args[0]) : 6;

      // 提交评分
      const input1 = await fhevm.createEncryptedInput(contractAddress, signers.bob.address);
      input1.add8(8);
      const enc1 = await input1.encrypt();
      await carRatingVault.connect(signers.bob).submitRating(ratingId, [enc1.handles[0]], enc1.inputProof);

      const input2 = await fhevm.createEncryptedInput(contractAddress, signers.carol.address);
      input2.add8(9);
      const enc2 = await input2.encrypt();
      await carRatingVault.connect(signers.carol).submitRating(ratingId, [enc2.handles[0]], enc2.inputProof);

      // 增加区块时间（模拟时间流逝）
      await ethers.provider.send("evm_increaseTime", [101]);
      await ethers.provider.send("evm_mine", []);

      // 授权解密
      await carRatingVault.connect(signers.alice).allowDecryption(ratingId);
    });

    it("应该能够解密评分结果", async function () {
      const results = await carRatingVault.getEncryptedResults(ratingId);

      // 解密总分
      const decryptedSum = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        results.dimensionSums[0],
        contractAddress,
        signers.alice
      );

      // 解密参与人数
      const decryptedCount = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        results.participantCount,
        contractAddress,
        signers.alice
      );

      expect(decryptedSum).to.equal(17); // 8 + 9
      expect(decryptedCount).to.equal(2);
    });
  });
});
