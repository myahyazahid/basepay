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

// USDC Contract on Base
export const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// BasepayProcessor Contract (Deployed on Base Mainnet - v2 without permit)
export const BASEPAY_PROCESSOR_ADDRESS = "0x1Db89eCf4B7df6981a0726965021A22121BF6A00";

// Treasury wallet address
export const TREASURY_ADDRESS = "0x6b82a9e45d4331c35ffc0a38fd084ca508ee7481";

// Fee percentage (3%)
export const FEE_PERCENTAGE = 0.03;

export const AIRDROP_CONTRACT_ADDRESS = "0xYOUR_AIRDROP_CONTRACT_ADDRESS";

// Standard USDC ABI for balance and approve
export const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
] as const;

// USDC Permit ABI (EIP-2612)
export const USDC_PERMIT_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

// BasepayProcessor ABI (without permit - wallet friendly)
export const BASEPAY_PROCESSOR_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "pay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "calculateFee",
    outputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "recipientAmount",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "usdc",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TREASURY",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FEE_BP",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "recipientAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "Payment",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_usdc",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
] as const;

// Network: Base Mainnet
export const BASE_CHAIN_ID = 8453;

// EIP-2612 Permit Domain for USDC on Base
export const USDC_PERMIT_DOMAIN = {
  name: "USD Coin",
  version: "2",
  chainId: BASE_CHAIN_ID,
  verifyingContract: USDC_CONTRACT_ADDRESS,
} as const;

// EIP-2612 Permit Types
export const USDC_PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;


export const AIRDROP_ABI = [
  {
    inputs: [
      { name: "airdropId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "txRef", type: "string" },
      { name: "signature", type: "bytes" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "airdropId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "airdropId", type: "uint256" }],
    name: "activeAirdrops",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "signer",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "airdropId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "txRef", type: "string" },
    ],
    name: "AirdropClaimed",
    type: "event",
  },
  {
    inputs: [
      { name: "_token", type: "address" },
      { name: "_signer", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
] as const;