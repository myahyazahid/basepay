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
    }),
    coinbaseWallet({
      appName: "BasePay",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

// USDC Contract Address di Base
export const USDC_CONTRACT_ADDRESS =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;

// USDC ABI (minimal untuk balanceOf)
export const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;
// Tambahkan di akhir file wagmi.ts
export const BASESCAN_API_KEY = "G2YNEAWZRFPGSKV1HMGDS1TTV98JZKZ5AR"; // Nanti bisa daftar di basescan.org
export const BASESCAN_API_URL = "https://api.basescan.org/api";
