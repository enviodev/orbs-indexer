import { createEffect, S } from "envio";
import { createPublicClient, http, parseAbi, defineChain } from "viem";

const CHAINLINK_ABI = parseAbi([
  "function latestAnswer() view returns (int256)",
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

// Input: "chainId:oracleAddress"
export const getChainlinkPrice = createEffect(
  {
    name: "getChainlinkPrice",
    input: S.string,
    output: S.string, // Return as string to avoid bigint serialization issues
    cache: false,
    rateLimit: false,
  },
  async ({ input }) => {
    const [chainIdStr, oracleAddress] = input.split(":");
    const chainId = Number(chainIdStr);
    const client = getClient(chainId);
    if (!client) return "";
    try {
      const answer = await client.readContract({
        address: oracleAddress as `0x${string}`,
        abi: CHAINLINK_ABI,
        functionName: "latestAnswer",
      });
      return answer.toString();
    } catch {
      return "";
    }
  }
);
