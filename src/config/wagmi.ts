import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

// GANTI ini dengan Project ID kamu dari https://cloud.walletconnect.com
// Kalau belum punya, pakai dummy dulu atau kosongin
const projectId = "52732025d7f26eafe99545ebbad20640";

export const config = createConfig({

  chains: [base],

  connectors: [
    injected({
      shimDisconnect: true,
    }),
     walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'BasePay',
        description: 'Crypto Payment Solution on Base',
        url:
          typeof window !== 'undefined'
            ? window.location.origin
            : 'https://basepay.vercel.app', // ganti sesuai domain
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    }),
    coinbaseWallet({
      appName: "BasePay",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

 // BasePay Payment Processor
export const BASEPAY_PROCESSOR_ADDRESS =
  "0xBASEPAY_PROCESSOR_CONTRACT_ADDRESS";

export const BASEPAY_PROCESSOR_ABI = [
  {
    inputs: [
      { name: "merchant", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" }
    ],
    name: "payWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

// USDC Contract Address di Base
export const USDC_CONTRACT_ADDRESS =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;

// USDC ABI (minimal untuk balanceOf)
// export const USDC_ABI = [
//   {
//     constant: true,
//     inputs: [{ name: "_owner", type: "address" }],
//     name: "balanceOf",
//     outputs: [{ name: "balance", type: "uint256" }],
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "decimals",
//     outputs: [{ name: "", type: "uint8" }],
//     type: "function",
//   },
// ] as const;

export const USDC_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// Tambahkan di akhir file wagmi.ts
export const BASESCAN_API_KEY = "G2YNEAWZRFPGSKV1HMGDS1TTV98JZKZ5AR"; // Nanti bisa daftar di basescan.org
export const BASESCAN_API_URL = "https://api.basescan.org/api";



// // USDC Contract on Base Mainnet
// export const USDC_CONTRACT_ADDRESS =
//   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// // BasePay Processor Contract Address
// // ⚠️ UPDATE THIS AFTER DEPLOYMENT!
// export const BASEPAY_PROCESSOR_ADDRESS =
//   "0xD8a1385bC64d99612746595FdD39B6c2DbA502Fc";

// // Treasury Wallet (hardcoded in smart contract)
// export const TREASURY_WALLET_ADDRESS =
//   "0xdCaF4cBac0246De4e1001444b02cBe814e4bAfa4";

// // Fee Configuration (1%)
// export const FEE_PERCENTAGE = 100; // basis points (100 = 1%)
// export const BASIS_POINTS = 10000;

// // USDC ABI (minimal for transfers and permit)
// export const USDC_ABI = [
//   {
//     inputs: [
//       { name: "recipient", type: "address" },
//       { name: "amount", type: "uint256" },
//     ],
//     name: "transfer",
//     outputs: [{ name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { name: "owner", type: "address" },
//       { name: "spender", type: "address" },
//     ],
//     name: "allowance",
//     outputs: [{ name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [{ name: "account", type: "address" }],
//     name: "balanceOf",
//     outputs: [{ name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [{ name: "owner", type: "address" }],
//     name: "nonces",
//     outputs: [{ name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "DOMAIN_SEPARATOR",
//     outputs: [{ name: "", type: "bytes32" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { name: "owner", type: "address" },
//       { name: "spender", type: "address" },
//       { name: "value", type: "uint256" },
//       { name: "deadline", type: "uint256" },
//       { name: "v", type: "uint8" },
//       { name: "r", type: "bytes32" },
//       { name: "s", type: "bytes32" },
//     ],
//     name: "permit",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
// ] as const;

// // BasePay Processor ABI
// export const BASEPAY_PROCESSOR_ABI = [
//   {
//     inputs: [
//       { name: "recipient", type: "address" },
//       { name: "totalAmount", type: "uint256" },
//       { name: "deadline", type: "uint256" },
//       { name: "v", type: "uint8" },
//       { name: "r", type: "bytes32" },
//       { name: "s", type: "bytes32" },
//     ],
//     name: "payWithPermit",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ name: "amount", type: "uint256" }],
//     name: "calculateFee",
//     outputs: [
//       { name: "feeAmount", type: "uint256" },
//       { name: "recipientAmount", type: "uint256" },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "getConfig",
//     outputs: [
//       { name: "treasury", type: "address" },
//       { name: "feePercentage", type: "uint256" },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "TREASURY_WALLET",
//     outputs: [{ name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "FEE_PERCENTAGE",
//     outputs: [{ name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, name: "sender", type: "address" },
//       { indexed: true, name: "recipient", type: "address" },
//       { indexed: false, name: "totalAmount", type: "uint256" },
//       { indexed: false, name: "recipientReceived", type: "uint256" },
//       { indexed: false, name: "feeAmount", type: "uint256" },
//       { indexed: false, name: "timestamp", type: "uint256" },
//     ],
//     name: "PaymentProcessed",
//     type: "event",
//   },
// ] as const;
