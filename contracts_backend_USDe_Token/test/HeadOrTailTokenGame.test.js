const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HeadOrTailTokenGame", function () {
  let headOrTailGame;
  let gameToken;
  let owner;
  let player;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20", owner);
    gameToken = await MockToken.deploy("Game Token", "GAME");
    await gameToken.waitForDeployment();

    // Deploy the game contract
    const HeadOrTailGame = await ethers.getContractFactory("HeadOrTailTokenGame", owner);
    headOrTailGame = await HeadOrTailGame.deploy(
      await gameToken.getAddress()
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
      
      // Check if GameResult event was emitted
      const event = receipt.logs.find(log => log.fragment?.name === "GameResult");
      expect(event).to.not.be.undefined;
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

    it("Should transfer tokens correctly on win", async function () {
      const initialBalance = await gameToken.balanceOf(player.address);
      const betAmount = ethers.parseEther("0.1"); // smallest bet amount
      
      const tx = await headOrTailGame.connect(player).play(true);
      await tx.wait();
      
      const finalBalance = await gameToken.balanceOf(player.address);
      
      // Either player lost betAmount or won more than initial
      const difference = finalBalance - initialBalance;
      expect(
        difference === -betAmount || 
        difference > 0
      ).to.be.true;
    });

    it("Should track head and tail counts correctly", async function () {
      // Play multiple games
      for(let i = 0; i < 5; i++) {
        await headOrTailGame.connect(player).play(true);
      }
      
      const totalHead = await headOrTailGame.getTotalHead();
      const totalTail = await headOrTailGame.getTotalTail();
      
      // Total of heads and tails should be 5
      expect(Number(totalHead) + Number(totalTail)).to.equal(5);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      // First add some funds to contract
      await gameToken.mint(await headOrTailGame.getAddress(), ethers.parseEther("100"));
      
      const initialBalance = await gameToken.balanceOf(owner.address);
      await headOrTailGame.withdrawFunds();
      const finalBalance = await gameToken.balanceOf(owner.address);
      
      expect(Number(finalBalance) > Number(initialBalance)).to.be.true;
    });

    it("Should allow owner to set RTP", async function () {
      await headOrTailGame.setRtp(20);
      const rtp = await headOrTailGame.getRtp();
      expect(Number(rtp)).to.equal(20);
    });

    it("Should allow owner to set bonus", async function () {
      await headOrTailGame.setBonus(25);
      const bonus = await headOrTailGame.getBonus();
      expect(Number(bonus)).to.equal(25);
    });

    it("Should not allow non-owner to set parameters", async function () {
      try {
        await headOrTailGame.connect(player).setRtp(20);
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Ownable: caller is not the owner");
      }
      
      try {
        await headOrTailGame.connect(player).setBonus(25);
        expect.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Ownable: caller is not the owner");
      }
    });
  });
});
