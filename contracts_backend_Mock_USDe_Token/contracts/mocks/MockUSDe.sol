// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDe is ERC20, Ownable {
    constructor() ERC20("Mock USDe", "USDe") Ownable() {
        // Initial supply of 1,000,000 USDe (with 18 decimals)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Function to mint more tokens (only owner)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Function to allow users to mint test tokens for themselves
    function faucet() public {
        // Mint 1000 USDe tokens to the caller
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}
