// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

/**
 * @notice YOLO minimal payment processor
 * @dev Fee langsung masuk treasury, no safety net
 */
contract BasepayProcessor {

    IERC20Permit public immutable usdc;

    address constant TREASURY =
        0xDcaf4cBAc0246DE4e1001444B02cBE814E4bAfa4;

    uint256 constant FEE_BP = 300;     // 1%
    uint256 constant BP = 10_000;

    constructor(address _usdc) {
        usdc = IERC20Permit(_usdc);
    }

    function pay(
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        uint256 fee = (amount * FEE_BP) / BP;

        // permit (IERC20Permit)
        usdc.permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        // transferFrom (IERC20)
        IERC20(address(usdc)).transferFrom(
            msg.sender,
            to,
            amount - fee
        );

        if (fee != 0) {
            IERC20(address(usdc)).transferFrom(
                msg.sender,
                TREASURY,
                fee
            );
        }
    }
}
