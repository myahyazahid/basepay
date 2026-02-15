// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title BasepayAirdrop
 * @notice Signature-based airdrop contract for BasePay
 * @dev Uses ECDSA signatures to verify claim eligibility
 */
contract BasepayAirdrop is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IERC20 public immutable token;
    
    // airdropId => user => claimed
    mapping(uint256 => mapping(address => bool)) public claimed;
    
    // airdropId => active status
    mapping(uint256 => bool) public activeAirdrops;
    
    // Signer address (backend wallet)
    address public signer;

    event AirdropClaimed(
        uint256 indexed airdropId,
        address indexed user,
        uint256 amount,
        string txRef
    );
    
    event AirdropActivated(uint256 indexed airdropId);
    event AirdropDeactivated(uint256 indexed airdropId);
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);

    constructor(address _token, address _signer) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_signer != address(0), "Invalid signer address");
        
        token = IERC20(_token);
        signer = _signer;
    }

    /**
     * @notice Claim airdrop tokens
     * @param airdropId Campaign ID from database
     * @param amount Amount of tokens to claim
     * @param txRef Unique transaction reference from backend
     * @param signature Backend signature for verification
     */
    function claim(
        uint256 airdropId,
        uint256 amount,
        string calldata txRef,
        bytes calldata signature
    ) external {
        require(activeAirdrops[airdropId], "Airdrop not active");
        require(!claimed[airdropId][msg.sender], "Already claimed");
        require(amount > 0, "Invalid amount");
        
        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(airdropId, msg.sender, amount, txRef)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        require(
            ethSignedMessageHash.recover(signature) == signer,
            "Invalid signature"
        );
        
        // Mark as claimed
        claimed[airdropId][msg.sender] = true;
        
        // Transfer tokens
        require(
            token.transfer(msg.sender, amount),
            "Token transfer failed"
        );
        
        emit AirdropClaimed(airdropId, msg.sender, amount, txRef);
    }

    /**
     * @notice Check if user has claimed from specific airdrop
     */
    function hasClaimed(uint256 airdropId, address user) 
        external 
        view 
        returns (bool) 
    {
        return claimed[airdropId][user];
    }

    /**
     * @notice Activate airdrop campaign
     */
    function activateAirdrop(uint256 airdropId) external onlyOwner {
        activeAirdrops[airdropId] = true;
        emit AirdropActivated(airdropId);
    }

    /**
     * @notice Deactivate airdrop campaign
     */
    function deactivateAirdrop(uint256 airdropId) external onlyOwner {
        activeAirdrops[airdropId] = false;
        emit AirdropDeactivated(airdropId);
    }

    /**
     * @notice Update signer address
     */
    function updateSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer");
        address oldSigner = signer;
        signer = newSigner;
        emit SignerUpdated(oldSigner, newSigner);
    }

    /**
     * @notice Withdraw tokens (emergency only)
     */
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(token.transfer(to, amount), "Transfer failed");
    }

    /**
     * @notice Get contract token balance
     */
    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
