import { getWalletClient, getPublicClient } from "wagmi/actions";
import type { Address } from "viem";
import { config } from "../config/wagmi"; // ⬅️ WAJIB

const USDC_ADDRESS: Address =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const USDC_PERMIT_ABI = [
  {
    name: "nonces",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

interface SignPermitParams {
  owner: Address;
  spender: Address;
  value: bigint;
}

export async function signUsdcPermit({
  owner,
  spender,
  value,
}: SignPermitParams): Promise<{
  deadline: bigint;
  v: number;
  r: Address;
  s: Address;
}> {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet not connected");

  const publicClient = await getPublicClient(config);
  if (!publicClient) throw new Error("Public client not found");

  const nonce = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: USDC_PERMIT_ABI,
    functionName: "nonces",
    args: [owner],
  });

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

  const domain = {
    name: "USD Coin",
    version: "2",
    chainId: 8453,
    verifyingContract: USDC_ADDRESS,
  } as const;

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  } as const;

  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: "Permit",
    message,
  });

  const r = signature.slice(0, 66) as Address;
  const s = ("0x" + signature.slice(66, 130)) as Address;
  const v = parseInt(signature.slice(130, 132), 16);

  return { deadline, v, r, s };
}
