import { createEffect, S } from "envio";
import { createPublicClient, http, parseAbi, defineChain } from "viem";

const ERC20_ABI = parseAbi([
  "function symbol() view returns (string)",
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

// Input: "chainId:tokenAddress"
export const getTokenSymbol = createEffect(
  {
    name: "getTokenSymbol",
    input: S.string,
    output: S.string,
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const [chainIdStr, tokenAddress] = input.split(":");
    const chainId = Number(chainIdStr);
    if (tokenAddress === "0x0000000000000000000000000000000000000000") return "Unknown";
    const client = getClient(chainId);
    if (!client) return "Unknown";
    try {
      return await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "symbol",
      });
    } catch {
      return "Unknown";
    }
  }
);

// Input: "chainId:tokenAddress"
export const getTokenDecimals = createEffect(
  {
    name: "getTokenDecimals",
    input: S.string,
    output: S.number,
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const [chainIdStr, tokenAddress] = input.split(":");
    const chainId = Number(chainIdStr);
    const client = getClient(chainId);
    if (!client) return 18;
    try {
      const decimals = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
      });
      return Number(decimals);
    } catch {
      return 18;
    }
  }
);
