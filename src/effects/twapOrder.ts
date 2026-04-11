import { createEffect, S } from "envio";
import { createPublicClient, http, parseAbi, defineChain } from "viem";

const TWAP_ABI = parseAbi([
  "function order(uint64 id) view returns (uint64, uint32, address, address, uint256, address, (address exchange, address srcToken, address dstToken, uint256 srcAmount, uint256 srcBidAmount, uint256 dstMinAmount, uint32 deadline, uint32 bidDelay, uint32 fillDelay, bytes data))",
]);

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
      const ask = result[6];
      return JSON.stringify({ srcToken: ask.srcToken, dstToken: ask.dstToken });
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
