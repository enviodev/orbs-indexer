import { ExecutorV5, ExecutorV6, BigDecimal } from "generated";
import { CHAIN_CONFIG, SWAP_TOTAL_ID } from "../constants/chain-config";
import { formatTimestamp } from "../utils/helpers";
import { getTokenSymbol } from "../effects/tokenMetadata";
import { getTransferLogs, parseTransferLogs } from "../effects/transactionReceipt";
import { fetchTokenUsdValue } from "../utils/pricing";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

async function calcMetrics(context: any, chainId: number, dollarValue: BigDecimal, timestamp: string) {
  const chainPrefix = `${chainId}-`;
  const day = timestamp.slice(0, 10);
  const dayKey = chainPrefix + day;
  let daily = await context.SwapDaily.get(dayKey);
  if (!daily) {
    context.SwapDaily.set({ id: dayKey, date: day, dailyTotalCalculatedValue: dollarValue, dailyCount: 1 });
  } else {
    context.SwapDaily.set({
      ...daily,
      dailyTotalCalculatedValue: daily.dailyTotalCalculatedValue.plus(dollarValue),
      dailyCount: (daily.dailyCount || 0) + 1,
    });
  }
  const totalKey = chainPrefix + SWAP_TOTAL_ID;
  let total = await context.SwapTotal.get(totalKey);
  if (!total) {
    context.SwapTotal.set({ id: totalKey, cumulativeTotalCalculatedValue: dollarValue, totalCount: 1 });
  } else {
    context.SwapTotal.set({
      ...total,
      cumulativeTotalCalculatedValue: total.cumulativeTotalCalculatedValue.plus(dollarValue),
      totalCount: (total.totalCount || 0) + 1,
    });
  }
}

async function saveLhOutputToken(context: any, chainId: number, dstTokenAddress: string) {
  const chainPrefix = `${chainId}-`;
  const outputId = chainPrefix + "LhOutputTokens";
  let outputTokens = await context.LhOutputTokens.get(outputId);
  if (!outputTokens) {
    context.LhOutputTokens.set({ id: outputId, tokenAddresses: [dstTokenAddress] });
  } else if (!outputTokens.tokenAddresses.includes(dstTokenAddress)) {
    context.LhOutputTokens.set({ ...outputTokens, tokenAddresses: [...outputTokens.tokenAddresses, dstTokenAddress] });
  }
}

// === ExecutorV5 Resolved ===
ExecutorV5.Resolved.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const txId = chainPrefix + event.transaction.hash;

  context.Resolved.set({
    id: `${chainId}_${event.transaction.hash}_${event.logIndex}`,
    orderHash: event.params.orderHash,
    swapper: event.params.swapper,
    ref: event.params.ref,
    inToken: event.params.inToken,
    outToken: event.params.outToken,
    inAmount: event.params.inAmount,
    outAmount: event.params.outAmount,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const config = CHAIN_CONFIG[chainId];
  const dstTokenAddress = event.params.outToken.toLowerCase();
  const treasuryAddress = config?.treasuryAddress?.toLowerCase() || "";
  const treasuryAddressNew = config?.treasuryAddressNew?.toLowerCase() || "";

  // Extract gasFees from Transfer logs via HyperSync (V5 only — V6 uses ExtraOut)
  let gasFees = "0";
  const transfersJson = await context.effect(getTransferLogs, `${chainId}:${event.block.number}:${event.transaction.hash}`);
  const transfers = parseTransferLogs(transfersJson);
  for (const transfer of transfers) {
    if ((transfer.to === treasuryAddress || transfer.to === treasuryAddressNew) && transfer.tokenAddress === dstTokenAddress) {
      gasFees = transfer.amount;
    }
  }

  const nativeAsset = config?.nativeAsset || "ETH";
  const timestamp = formatTimestamp(event.block.timestamp);
  const srcTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${event.params.inToken}`);
  const dstTokenSymbol = event.params.outToken.toLowerCase() === ADDRESS_ZERO
    ? nativeAsset
    : await context.effect(getTokenSymbol, `${chainId}:${event.params.outToken}`);

  let swap = await context.Swap.get(txId);
  const dexAmountOut = swap?.dexAmountOut
    ? (BigInt(swap.dexAmountOut) + event.params.outAmount).toString()
    : event.params.outAmount.toString();

  const dollarValue = await fetchTokenUsdValue(
    context, chainId,
    srcTokenSymbol, event.params.inToken.toLowerCase(), event.params.inAmount.toString(),
    dstTokenSymbol, dstTokenAddress, dexAmountOut
  );

  context.Swap.set({
    id: txId,
    txHash: event.transaction.hash,
    timestamp,
    userAddress: event.params.swapper.toLowerCase(),
    executorAddress: event.srcAddress.toLowerCase(),
    srcTokenAddress: event.params.inToken.toLowerCase(),
    srcTokenSymbol,
    srcAmount: event.params.inAmount.toString(),
    dstTokenAddress,
    dstTokenSymbol,
    dexAmountOut,
    gasFees,
    dollarValue,
    fees: swap?.fees,
  });

  await calcMetrics(context, chainId, dollarValue, timestamp);
  await saveLhOutputToken(context, chainId, dstTokenAddress);
});

// === ExecutorV5 Surplus ===
ExecutorV5.Surplus.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const txId = chainPrefix + event.transaction.hash;

  context.Surplus.set({
    id: `${chainId}_${event.transaction.hash}_${event.logIndex}`,
    swapper: event.params.swapper,
    ref: event.params.ref,
    token: event.params.token,
    amount: event.params.amount,
    refshare: event.params.refshare,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const userSurplus = event.params.amount - event.params.refshare;
  let swap = await context.Swap.get(txId);
  if (swap) {
    const dexAmountOut = swap.dexAmountOut ? (BigInt(swap.dexAmountOut) + userSurplus).toString() : userSurplus.toString();
    const dollarValue = await fetchTokenUsdValue(
      context, chainId,
      swap.srcTokenSymbol, swap.srcTokenAddress, swap.srcAmount,
      swap.dstTokenSymbol, swap.dstTokenAddress, dexAmountOut
    );
    context.Swap.set({ ...swap, dexAmountOut, fees: event.params.refshare.toString(), dollarValue });
  } else {
    context.Swap.set({
      id: txId, userAddress: "", dollarValue: new BigDecimal(0), executorAddress: "", timestamp: "",
      txHash: event.transaction.hash, dexAmountOut: userSurplus.toString(), fees: event.params.refshare.toString(),
      srcTokenSymbol: undefined, srcTokenAddress: undefined, srcAmount: undefined,
      dstTokenSymbol: undefined, dstTokenAddress: undefined, gasFees: undefined,
    });
  }
});

// === ExecutorV6 ResolvedV6 ===
ExecutorV6.ResolvedV6.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const txId = chainPrefix + event.transaction.hash;

  context.Resolved.set({
    id: `${chainId}_${event.transaction.hash}_${event.logIndex}`,
    orderHash: event.params.orderHash,
    swapper: event.params.swapper,
    ref: event.params.ref,
    inToken: event.params.inToken,
    outToken: event.params.outToken,
    inAmount: event.params.inAmount,
    outAmount: event.params.outAmount,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const nativeAsset = CHAIN_CONFIG[chainId]?.nativeAsset || "ETH";
  const dstTokenAddress = event.params.outToken.toLowerCase();
  const timestamp = formatTimestamp(event.block.timestamp);
  const srcTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${event.params.inToken}`);
  const dstTokenSymbol = event.params.outToken.toLowerCase() === ADDRESS_ZERO
    ? nativeAsset
    : await context.effect(getTokenSymbol, `${chainId}:${event.params.outToken}`);

  let swap = await context.Swap.get(txId);
  const dexAmountOut = swap?.dexAmountOut
    ? (BigInt(swap.dexAmountOut) + event.params.outAmount).toString()
    : event.params.outAmount.toString();

  const dollarValue = await fetchTokenUsdValue(
    context, chainId,
    srcTokenSymbol, event.params.inToken.toLowerCase(), event.params.inAmount.toString(),
    dstTokenSymbol, dstTokenAddress, dexAmountOut
  );

  context.Swap.set({
    id: txId, txHash: event.transaction.hash, timestamp,
    userAddress: event.params.swapper.toLowerCase(),
    executorAddress: event.srcAddress.toLowerCase(),
    srcTokenAddress: event.params.inToken.toLowerCase(), srcTokenSymbol,
    srcAmount: event.params.inAmount.toString(),
    dstTokenAddress, dstTokenSymbol, dexAmountOut, dollarValue,
    fees: swap?.fees, gasFees: swap?.gasFees,
  });

  await calcMetrics(context, chainId, dollarValue, timestamp);
  await saveLhOutputToken(context, chainId, dstTokenAddress);
});

// === ExecutorV6 SurplusV6 ===
ExecutorV6.SurplusV6.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const txId = chainPrefix + event.transaction.hash;

  context.Surplus.set({
    id: `${chainId}_${event.transaction.hash}_${event.logIndex}`,
    swapper: event.params.swapper,
    ref: event.params.ref,
    token: event.params.token,
    amount: event.params.amount,
    refshare: event.params.refshare,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const userSurplus = event.params.amount - event.params.refshare;
  let swap = await context.Swap.get(txId);
  if (swap) {
    const dexAmountOut = swap.dexAmountOut ? (BigInt(swap.dexAmountOut) + userSurplus).toString() : userSurplus.toString();
    const dollarValue = await fetchTokenUsdValue(
      context, chainId,
      swap.srcTokenSymbol, swap.srcTokenAddress, swap.srcAmount,
      swap.dstTokenSymbol, swap.dstTokenAddress, dexAmountOut
    );
    context.Swap.set({ ...swap, dexAmountOut, fees: event.params.refshare.toString(), dollarValue });
  } else {
    context.Swap.set({
      id: txId, userAddress: "", dollarValue: new BigDecimal(0), executorAddress: "", timestamp: "",
      txHash: event.transaction.hash, dexAmountOut: userSurplus.toString(), fees: event.params.refshare.toString(),
      srcTokenSymbol: undefined, srcTokenAddress: undefined, srcAmount: undefined,
      dstTokenSymbol: undefined, dstTokenAddress: undefined, gasFees: undefined,
    });
  }
});

// === ExecutorV6 ExtraOut ===
ExecutorV6.ExtraOut.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const txId = chainPrefix + event.transaction.hash;

  context.ExtraOut.set({
    id: `${chainId}_${event.transaction.hash}_${event.logIndex}`,
    recipient: event.params.recipient,
    token: event.params.token,
    amount: event.params.amount,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  let swap = await context.Swap.get(txId);
  if (!swap) {
    context.Swap.set({
      id: txId, userAddress: "", dollarValue: new BigDecimal(0), executorAddress: "", timestamp: "",
      txHash: event.transaction.hash, gasFees: event.params.amount.toString(),
      srcTokenSymbol: undefined, srcTokenAddress: undefined, srcAmount: undefined,
      dstTokenSymbol: undefined, dstTokenAddress: undefined, dexAmountOut: undefined, fees: undefined,
    });
  } else {
    context.Swap.set({ ...swap, gasFees: event.params.amount.toString() });
  }
});
