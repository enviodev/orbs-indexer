import { createEffect, S } from "envio";
import { createPublicClient, http, parseAbi, defineChain } from "viem";

const CHAINLINK_ABI = parseAbi([
  "function latestAnswer() view returns (int256)",
  "function decimals() view returns (uint8)",
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

// Input: "chainId:oracleAddress" — cached by oracle, not block (decimals are immutable per feed).
export const getChainlinkOracleDecimals = createEffect(
  {
    name: "getChainlinkOracleDecimals",
    input: S.string,
    output: S.number,
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const [chainIdStr, oracleAddress] = input.split(":");
    const chainId = Number(chainIdStr);
    const client = getClient(chainId);
    if (!client) return 8;
    try {
      const d = await client.readContract({
        address: oracleAddress as `0x${string}`,
        abi: CHAINLINK_ABI,
        functionName: "decimals",
      });
      return Number(d);
    } catch {
      return 8;
    }
  }
);

// Input: "chainId:oracleAddress:blockNumber"
export const getChainlinkPrice = createEffect(
  {
    name: "getChainlinkPrice",
    input: S.string,
    output: S.string,
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const parts = input.split(":");
    const chainId = Number(parts[0]);
    const oracleAddress = parts[1];
    const blockNumber = parts[2] ? BigInt(parts[2]) : undefined;
    const client = getClient(chainId);
    if (!client) return "";
    try {
      const answer = await client.readContract({
        address: oracleAddress as `0x${string}`,
        abi: CHAINLINK_ABI,
        functionName: "latestAnswer",
        blockNumber,
      });
      return answer.toString();
    } catch {
      return "";
    }
  }
);
