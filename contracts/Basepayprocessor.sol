// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice Wallet-friendly payment processor
 * @dev Uses standard approve + transferFrom (no permit)
 * @dev Fee automatically deducted and sent to treasury
 */
contract BasepayProcessor {
    IERC20 public immutable usdc;

   address public constant TREASURY = 0x6B82a9E45d4331C35Ffc0a38FD084Ca508EE7481;

    uint256 public constant FEE_BP = 300;  // 3%
    uint256 public constant BP = 10_000;

    event Payment(
        address indexed from,
        address indexed to,
        uint256 totalAmount,
        uint256 recipientAmount,
        uint256 fee
    );

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Pay with automatic fee deduction
     * @dev User must approve USDC to this contract first
     * @param to Recipient address
     * @param amount Total amount (including fee)
     */
    function pay(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");

        // Calculate fee
        uint256 fee = (amount * FEE_BP) / BP;
        uint256 recipientAmount = amount - fee;

        // Transfer to recipient
        require(
            usdc.transferFrom(msg.sender, to, recipientAmount),
            "Transfer to recipient failed"
        );

        // Transfer fee to treasury
        if (fee > 0) {
            require(
                usdc.transferFrom(msg.sender, TREASURY, fee),
                "Fee transfer failed"
            );
        }

        emit Payment(msg.sender, to, amount, recipientAmount, fee);
    }

    /**
     * @notice Get fee amount for given total
     * @param amount Total amount
     * @return fee Fee amount
     * @return recipientAmount Amount recipient receives
     */
    function calculateFee(uint256 amount) 
        external 
        pure 
        returns (uint256 fee, uint256 recipientAmount) 
    {
        fee = (amount * FEE_BP) / BP;
        recipientAmount = amount - fee;
    }
}