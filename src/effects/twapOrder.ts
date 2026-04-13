import { createEffect, S } from "envio";
import { createPublicClient, http, defineChain } from "viem";

const TWAP_ABI = [
  {
    name: "order",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint64" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint64" },
          { name: "status", type: "uint32" },
          { name: "time", type: "uint32" },
          { name: "filledTime", type: "uint32" },
          { name: "srcFilledAmount", type: "uint256" },
          { name: "maker", type: "address" },
          {
            name: "ask",
            type: "tuple",
            components: [
              { name: "exchange", type: "address" },
              { name: "srcToken", type: "address" },
              { name: "dstToken", type: "address" },
              { name: "srcAmount", type: "uint256" },
              { name: "srcBidAmount", type: "uint256" },
              { name: "dstMinAmount", type: "uint256" },
              { name: "deadline", type: "uint32" },
              { name: "bidDelay", type: "uint32" },
              { name: "fillDelay", type: "uint32" },
              { name: "data", type: "bytes" },
            ],
          },
          {
            name: "bid",
            type: "tuple",
            components: [
              { name: "time", type: "uint32" },
              { name: "taker", type: "address" },
              { name: "exchange", type: "address" },
              { name: "dstAmount", type: "uint256" },
              { name: "dstFee", type: "uint256" },
              { name: "data", type: "bytes" },
            ],
          },
        ],
      },
    ],
  },
] as const;

const clientCache = new Map<number, ReturnType<typeof createPublicClient>>();
function getClient(chainId: number) {
  if (!clientCache.has(chainId)) {
    const rpcUrl = process.env[`ENVIO_RPC_URL_${chainId}`] || "";
    if (!rpcUrl) return null;
    clientCache.set(chainId, createPublicClient({
      chain: defineChain({ id: chainId, name: `chain-${chainId}`, nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } }),
      transport: http(rpcUrl),
    }));
  }
  return clientCache.get(chainId)!;
}

// Input: "chainId:twapAddress:orderId"
export const getTwapOrder = createEffect(
  {
    name: "getTwapOrder",
    input: S.string,
    output: S.string, // JSON: { srcToken, dstToken } or ""
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const parts = input.split(":");
    const chainId = Number(parts[0]);
    const twapAddress = parts[1];
    const orderId = BigInt(parts[2] || "0");
    const client = getClient(chainId);
    if (!client) return "";
    try {
      const result = await client.readContract({
        address: twapAddress as `0x${string}`,
        abi: TWAP_ABI,
        functionName: "order",
        args: [orderId],
      });
      return JSON.stringify({ srcToken: result.ask.srcToken, dstToken: result.ask.dstToken });
    } catch {
      return "";
    }
  }
);

export function parseTwapOrder(result: string): { srcToken: string; dstToken: string } | null {
  if (!result) return null;
  try {
    return JSON.parse(result);
  } catch {
    return null;
  }
}
