// // // scripts/deploy-mainnet.js
// // const hre = require("hardhat");

// // async function main() {
// //   console.log("🚀 Deploying BasepayProcessor to Base Mainnet...\n");
// //   console.log("=" .repeat(60));

// //   // USDC on Base Mainnet
// //   const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
// //   // Your treasury wallet (hardcoded in contract)
// //   const TREASURY_WALLET = "0xdCaF4cBac0246De4e1001444b02cBe814e4bAfa4";

// //   console.log("\n📋 Configuration:");
// //   console.log("-".repeat(60));
// //   console.log("USDC Address:", USDC_ADDRESS);
// //   console.log("Treasury Wallet:", TREASURY_WALLET);
// //   console.log("Fee Percentage: 3% (300 basis points)");
// //   console.log("Network: Base Mainnet");
// //   console.log("-".repeat(60));

// //   // Get deployer account
// //   const [deployer] = await hre.ethers.getSigners();
// //   console.log("\n👤 Deployer Account:", deployer.address);
  
// //   const balance = await hre.ethers.provider.getBalance(deployer.address);
// //   console.log("💰 Deployer Balance:", hre.ethers.formatEther(balance), "ETH");

// //   if (balance < hre.ethers.parseEther("0.01")) {
// //     console.log("\n⚠️  WARNING: Low balance! You need at least 0.01 ETH for gas");
// //     console.log("Please add more ETH to:", deployer.address);
// //     process.exit(1);
// //   }

// //   console.log("\n⏳ Deploying contract...");
// //   console.log("-".repeat(60));

// //   // Get contract factory
// //   const BasepayProcessor = await hre.ethers.getContractFactory("BasepayProcessor");

// //   // Deploy
// //   const basepayProcessor = await BasepayProcessor.deploy(USDC_ADDRESS);
// //   await basepayProcessor.waitForDeployment();

// //   const contractAddress = await basepayProcessor.getAddress();

// //   console.log("\n✅ CONTRACT DEPLOYED SUCCESSFULLY!");
// //   console.log("=" .repeat(60));
// //   console.log("\n📍 Contract Address:", contractAddress);
// //   console.log("🔗 BaseScan URL: https://basescan.org/address/" + contractAddress);

// //   // Verify configuration
// //   console.log("\n🔍 Verifying Configuration...");
// //   console.log("-".repeat(60));
  
// //   const [treasuryFromContract, feePercentage] = await basepayProcessor.getConfig();
// //   console.log("Treasury Wallet:", treasuryFromContract);
// //   console.log("Fee Percentage:", feePercentage.toString(), "basis points (1%)");
  
// //   if (treasuryFromContract.toLowerCase() !== TREASURY_WALLET.toLowerCase()) {
// //     console.log("\n❌ ERROR: Treasury address mismatch!");
// //     process.exit(1);
// //   }
// //   console.log("✅ Configuration verified!");

// //   // Wait for block confirmations
// //   console.log("\n⏳ Waiting for 5 block confirmations...");
// //   const deployTx = basepayProcessor.deploymentTransaction();
// //   if (deployTx) {
// //     await deployTx.wait(5);
// //     console.log("✅ Confirmations complete!");
// //   }

// //   // Verify on BaseScan
// //   console.log("\n📝 Verifying contract on BaseScan...");
// //   console.log("-".repeat(60));
  
// //   try {
// //     await hre.run("verify:verify", {
// //       address: contractAddress,
// //       constructorArguments: [USDC_ADDRESS],
// //     });
// //     console.log("✅ Contract verified on BaseScan!");
// //   } catch (error) {
// //     if (error.message.includes("already verified")) {
// //       console.log("ℹ️  Contract already verified!");
// //     } else {
// //       console.log("⚠️  Verification failed:", error.message);
// //       console.log("\nYou can verify manually at:");
// //       console.log("https://basescan.org/address/" + contractAddress + "#code");
// //       console.log("\nConstructor arguments:");
// //       console.log("USDC Address:", USDC_ADDRESS);
// //     }
// //   }

// //   // Final output
// //   console.log("\n" + "=".repeat(60));
// //   console.log("🎉 DEPLOYMENT COMPLETE!");
// //   console.log("=".repeat(60));

// //   console.log("\n📌 NEXT STEPS:");
// //   console.log("-".repeat(60));
// //   console.log("1. Update your wagmi config:");
// //   console.log(`   export const BASEPAY_PROCESSOR_ADDRESS = "${contractAddress}";`);
// //   console.log("\n2. Run database migration:");
// //   console.log("   Execute migrations/create_fee_revenue_table.sql in Supabase");
// //   console.log("\n3. Update your SendPreviewPage.tsx with the new contract");
// //   console.log("\n4. Test with small amount first (1-10 USDC)");
// //   console.log("\n5. Monitor transactions on BaseScan");
// //   console.log("-".repeat(60));

// //   console.log("\n💡 IMPORTANT REMINDERS:");
// //   console.log("-".repeat(60));
// //   console.log("• Fee: 1% automatically deducted");
// //   console.log("• Treasury: " + TREASURY_WALLET);
// //   console.log("• Users only sign ONCE (no approve needed)");
// //   console.log("• Contract is immutable (cannot be changed)");
// //   console.log("• Track revenue in fee_revenue table");
// //   console.log("-".repeat(60));

// //   console.log("\n✅ All done! Contract is live on Base mainnet! 🚀\n");
// // }

// // main()
// //   .then(() => process.exit(0))
// //   .catch((error) => {
// //     console.error("\n❌ DEPLOYMENT FAILED:");
// //     console.error(error);
// //     process.exit(1);
// //   });

// require("dotenv").config();
// const hre = require("hardhat");

// async function main() {
//   console.log("🚀 Deploying BasepayProcessor (YOLO) to Base Mainnet");
//   console.log("=".repeat(60));

//   const USDC_ADDRESS =
//     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

//   const [deployer] = await hre.ethers.getSigners();

//   const balance = await hre.ethers.provider.getBalance(deployer.address);

//   console.log("👤 Deployer:", deployer.address);
//   console.log(
//     "💰 Balance:",
//     hre.ethers.formatEther(balance),
//     "ETH"
//   );

//   console.log("\n⏳ Deploying...");
//   console.log("-".repeat(60));

//   const Factory = await hre.ethers.getContractFactory(
//     "BasepayProcessor"
//   );

//   const contract = await Factory.deploy(USDC_ADDRESS);
//   await contract.waitForDeployment();

//   const address = await contract.getAddress();

//   console.log("\n✅ DEPLOY SUCCESS!");
//   console.log("📍 Contract:", address);
//   console.log(
//     "🔗 BaseScan:",
//     `https://basescan.org/address/${address}`
//   );

//   console.log("\n⚠️ NOTE:");
//   console.log("- Treasury is HARD-CODED in contract");
//   console.log("- Fee = 1%");
//   console.log("- Contract is IMMUTABLE");
// }

// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });


const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BasepayProcessor (YOLO v2) to Base Mainnet");
  console.log("============================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

  console.log("⏳ Deploying...");
  console.log("------------------------------------------------------------");

  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const BasepayProcessor = await hre.ethers.getContractFactory("BasepayProcessor");
  const contract = await BasepayProcessor.deploy(USDC_ADDRESS);

  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();

  console.log("✅ DEPLOY SUCCESS!");
  console.log("📍 Contract:", contractAddress);
  console.log("🔍 BaseScan:", `https://basescan.org/address/${contractAddress}`);
  console.log("");
  console.log("⚠️ NOTE:");
  console.log("- Treasury is HARD-CODED in contract");
  console.log("- Fee = 3%");
  console.log("- Contract is IMMUTABLE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });