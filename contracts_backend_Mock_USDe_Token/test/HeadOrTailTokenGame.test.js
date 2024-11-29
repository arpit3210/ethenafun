const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HeadOrTailTokenGame", function () {
  let headOrTailGame;
  let gameToken;
  let owner;
  let player;
  let vrfCoordinator;
  
  const SUBSCRIPTION_ID = 1n;
  const GAS_LANE = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const CALLBACK_GAS_LIMIT = 100000n;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();

    // Deploy mock VRF Coordinator
    const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinatorV2", owner);
    vrfCoordinator = await MockVRFCoordinator.deploy();
    await vrfCoordinator.waitForDeployment();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20", owner);
    gameToken = await MockToken.deploy("Game Token", "GAME");
    await gameToken.waitForDeployment();

    // Deploy the game contract
    const HeadOrTailGame = await ethers.getContractFactory("HeadOrTailTokenGame", owner);
    headOrTailGame = await HeadOrTailGame.deploy(
      await vrfCoordinator.getAddress(),
      await gameToken.getAddress(),
      SUBSCRIPTION_ID,
      GAS_LANE,
      CALLBACK_GAS_LIMIT
    );
    await headOrTailGame.waitForDeployment();

    // Mint some tokens to player
    await gameToken.mint(await player.getAddress(), ethers.parseEther("1000"));
    // Approve game contract to spend player's tokens
    await gameToken.connect(player).approve(await headOrTailGame.getAddress(), ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await headOrTailGame.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the correct game token", async function () {
      expect(await headOrTailGame.gameToken()).to.equal(await gameToken.getAddress());
    });
  });

  describe("Game Mechanics", function () {
    it("Should allow player to place a bet with valid amount", async function () {
      const tx = await headOrTailGame.connect(player).play(true);
      const receipt = await tx.wait();
      expect(receipt.logs.some(log => log.fragment?.name === "RequestedRandomNumber")).to.be.true;
    });

    it("Should not allow invalid bet amounts", async function () {
      // Remove token approval
      await gameToken.connect(player).approve(await headOrTailGame.getAddress(), 0);
      
      // Try to play without proper token approval
      try {
        await headOrTailGame.connect(player).play(true);
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Please send correct amount to play the game");
      }
    });

    it("Should process game result correctly", async function () {
      const tx = await headOrTailGame.connect(player).play(true);
      const receipt = await tx.wait();
      
      // Get the RequestId from the event
      const requestId = receipt.logs.find(
        log => log.fragment?.name === "RequestedRandomNumber"
      ).args[0];

      // Simulate VRF callback with a winning result
      await vrfCoordinator.fulfillRandomWords(requestId, [2n]); // Even number = heads

      // Check game status
      const gameStatus = await headOrTailGame.gameStatus(requestId);
      expect(gameStatus.fulfilled).to.be.true;
      expect(gameStatus.isWinner).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      // First add some funds to contract
      await gameToken.mint(await headOrTailGame.getAddress(), ethers.parseEther("100"));
      
      const initialBalance = await gameToken.balanceOf(await owner.getAddress());
      await headOrTailGame.withdrawFunds();
      const finalBalance = await gameToken.balanceOf(await owner.getAddress());
      
      expect(finalBalance).to.equal(initialBalance + BigInt(ethers.parseEther("100")));
    });

    it("Should allow owner to set RTP", async function () {
      await headOrTailGame.setRtp(20n);
      expect(await headOrTailGame.getRtp()).to.equal(20n);
    });

    it("Should allow owner to set bonus", async function () {
      await headOrTailGame.setBonus(25n);
      expect(await headOrTailGame.getBonus()).to.equal(25n);
    });
  });
});
