import { Reactor, BigDecimal } from "generated";
import { CHAIN_CONFIG, SWAP_TOTAL_ID } from "../constants/chain-config";
import { formatTimestamp } from "../utils/helpers";
import { getTokenSymbol } from "../effects/tokenMetadata";
import { getTransferLogs, parseTransferLogs } from "../effects/transactionReceipt";
import { fetchTokenUsdValue } from "../utils/pricing";

Reactor.Fill.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const id = `${chainId}_${event.transaction.hash}_${event.logIndex}`;
  const txId = chainPrefix + event.transaction.hash;

  context.Fill.set({
    id,
    orderHash: event.params.orderHash,
    filler: event.params.filler,
    swapper: event.params.swapper,
    nonce: event.params.nonce,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const timestamp = formatTimestamp(event.block.timestamp);
  const userAddress = event.params.swapper.toLowerCase();
  const executorAddress = event.params.filler.toLowerCase();
  const config = CHAIN_CONFIG[chainId];

  // TODO: Re-enable receipt parsing once Effect performance is acceptable
  // The Resolved/Surplus/ExtraOut handlers in the same tx populate the Swap entity
  // with token addresses, amounts, fees and gasFees from their event params directly.
  // Receipt parsing here is redundant for those fields.
  //
  // const transfersJson = await context.effect(getTransferLogs, `${chainId}:${event.block.number}:${event.transaction.hash}`);
  // const transfers = parseTransferLogs(transfersJson);
  // ... receipt parsing logic ...

  // Swap will be populated by Resolved/Surplus/ExtraOut handlers
  const dollarValue = new BigDecimal(0);

  // Create initial Swap stub — Resolved/Surplus/ExtraOut handlers will fill in the details
  context.Swap.set({
    id: txId,
    userAddress,
    dollarValue,
    executorAddress,
    timestamp,
    txHash: event.transaction.hash,
    srcTokenSymbol: undefined,
    srcTokenAddress: undefined,
    srcAmount: undefined,
    dstTokenSymbol: undefined,
    dstTokenAddress: undefined,
    dexAmountOut: undefined,
    fees: undefined,
    gasFees: undefined,
  });

  // Daily aggregation
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
});
