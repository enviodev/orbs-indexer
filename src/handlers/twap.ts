import { TwapContract, BigDecimal } from "generated";
import { getDexByRouter } from "../constants/dex-routers";
import { CHAIN_CONFIG } from "../constants/chain-config";
import { formatTimestamp } from "../utils/helpers";
import { getTokenSymbol } from "../effects/tokenMetadata";
import { getTwapOrder, parseTwapOrder } from "../effects/twapOrder";
import { getTransferLogs, parseTransferLogs } from "../effects/transactionReceipt";
import { fetchUSDValue } from "../utils/pricing";

TwapContract.OrderFilled.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const entityId = `${chainId}_${event.transaction.hash}_${event.logIndex}`;
  const twapAddress = event.srcAddress;
  const dex = getDexByRouter(event.params.exchange);
  const timestamp = formatTimestamp(event.block.timestamp);
  const srcAmountInStr = event.params.srcAmountIn.toString();
  const dstAmountOutStr = event.params.dstAmountOut.toString();
  const type = srcAmountInStr === event.params.srcFilledAmount.toString() ? "LIMIT" : "TWAP";

  // Fetch order details for token addresses
  const orderResult = await context.effect(getTwapOrder, `${chainId}:${twapAddress}:${event.params.id}`);
  const order = parseTwapOrder(orderResult);

  let srcTokenAddress: string | undefined;
  let dstTokenAddress: string | undefined;
  let srcTokenSymbol: string | undefined;
  let dstTokenSymbol: string | undefined;

  if (order) {
    srcTokenAddress = order.srcToken;
    dstTokenAddress = order.dstToken;
    srcTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${srcTokenAddress}`);
    dstTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${dstTokenAddress}`);
  }

  const dollarValueIn = srcTokenSymbol && srcTokenAddress
    ? (await fetchUSDValue(context, chainId, srcTokenSymbol, srcTokenAddress, event.block.number)).times(new BigDecimal(srcAmountInStr))
    : new BigDecimal(0);

  const dollarValueOut = dstTokenSymbol && dstTokenAddress
    ? (await fetchUSDValue(context, chainId, dstTokenSymbol, dstTokenAddress, event.block.number)).times(new BigDecimal(dstAmountOutStr))
    : new BigDecimal(0);

  let dollarValue = dollarValueOut;
  if (!dollarValueIn.isZero()) {
    dollarValue = dollarValueIn;
  }

  // Extract dexFee from Transfer logs via HyperSync
  let dexFee: string | undefined;
  const config = CHAIN_CONFIG[chainId];
  if (config && config.feesAddress) {
    const transfersJson = await context.effect(getTransferLogs, `${chainId}:${event.block.number}:${event.transaction.hash}`);
    const transfers = parseTransferLogs(transfersJson);
    for (const transfer of transfers) {
      if (transfer.to === config.feesAddress.toLowerCase()) {
        dexFee = transfer.amount;
        break;
      }
    }
  }

  context.OrderFilled.set({
    id: entityId,
    TWAP_id: Number(event.params.id),
    twapAddress,
    userAddress: event.params.maker,
    exchange: event.params.exchange,
    dex,
    taker: event.params.taker,
    srcAmountIn: srcAmountInStr,
    dstAmountOut: dstAmountOutStr,
    dstFee: event.params.dstFee,
    dexFee,
    srcFilledAmount: event.params.srcFilledAmount,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
    timestamp,
    srcTokenAddress,
    dstTokenAddress,
    srcTokenSymbol,
    dstTokenSymbol,
    dollarValueIn,
    dollarValueOut,
    type,
  });

  // Daily aggregation
  const day = timestamp.slice(0, 10);
  const key = chainPrefix + `${dex}_${day}`;
  let daily = await context.FilledDaily.get(key);
  if (!daily) {
    context.FilledDaily.set({
      id: key, date: day, dailyTotalCalculatedValue: dollarValue, dailyCount: 1, dex, exchange: event.params.exchange,
    });
  } else {
    context.FilledDaily.set({
      ...daily, dailyTotalCalculatedValue: daily.dailyTotalCalculatedValue.plus(dollarValue), dailyCount: (daily.dailyCount || 0) + 1,
    });
  }

  // Cumulative total
  const totalKey = chainPrefix + dex;
  let total = await context.FilledTotal.get(totalKey);
  if (!total) {
    context.FilledTotal.set({ id: totalKey, cumulativeTotalCalculatedValue: dollarValue, totalCount: 1 });
  } else {
    context.FilledTotal.set({
      ...total, cumulativeTotalCalculatedValue: total.cumulativeTotalCalculatedValue.plus(dollarValue), totalCount: (total.totalCount || 0) + 1,
    });
  }

  // Save output token
  if (dstTokenAddress) {
    const outputId = chainPrefix + "TwapOutputTokens";
    let outputTokens = await context.TwapOutputTokens.get(outputId);
    if (!outputTokens) {
      context.TwapOutputTokens.set({ id: outputId, tokenAddresses: [dstTokenAddress] });
    } else if (!outputTokens.tokenAddresses.includes(dstTokenAddress)) {
      context.TwapOutputTokens.set({ ...outputTokens, tokenAddresses: [...outputTokens.tokenAddresses, dstTokenAddress] });
    }
  }
});

TwapContract.OrderCreated.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const entityId = `${chainId}_${event.transaction.hash}_${event.logIndex}`;
  const twapAddress = event.srcAddress;
  const timestamp = formatTimestamp(event.block.timestamp);
  const dex = getDexByRouter(event.params.exchange);

  // The ask param is a tuple: (exchange, srcToken, dstToken, srcAmount, srcBidAmount, dstMinAmount, deadline, bidDelay, fillDelay, data)
  const ask = event.params.ask;
  const srcTokenAddress = ask[1];
  const dstTokenAddress = ask[2];
  const srcTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${srcTokenAddress}`);
  const dstTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${dstTokenAddress}`);

  const ask_srcAmount = ask[3];
  const ask_srcBidAmount = ask[4];
  const type = ask_srcAmount === ask_srcBidAmount ? "LIMIT" : "TWAP";

  const dollarValueIn = srcTokenSymbol
    ? (await fetchUSDValue(context, chainId, srcTokenSymbol, srcTokenAddress as string)).times(new BigDecimal(ask_srcAmount.toString()))
    : new BigDecimal(0);

  context.OrderCreated.set({
    id: entityId,
    Contract_id: event.params.id,
    twapAddress,
    maker: event.params.maker,
    exchange: event.params.exchange,
    ask_exchange: ask[0] as string,
    ask_srcToken: srcTokenAddress as string,
    ask_dstToken: dstTokenAddress as string,
    ask_srcAmount: ask_srcAmount as bigint,
    ask_srcBidAmount: ask_srcBidAmount as bigint,
    ask_dstMinAmount: ask[5] as bigint,
    ask_deadline: ask[6] as bigint,
    ask_bidDelay: ask[7] as bigint,
    ask_fillDelay: ask[8] as bigint,
    ask_data: (ask[9] as string) || "",
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
    srcTokenSymbol,
    dstTokenSymbol,
    dollarValueIn,
    timestamp,
    dex,
    type,
  });

  // Status entities
  const orderId = event.params.id.toString();
  context.Status.set({ id: chainPrefix + orderId, status: undefined });
  context.StatusNew.set({
    id: chainPrefix + `${twapAddress}_${orderId}`,
    twapId: orderId,
    twapAddress,
    status: undefined,
  });

  // Daily aggregation
  const day = timestamp.slice(0, 10);
  const key = chainPrefix + `${dex}_${day}`;
  let daily = await context.CreatedDaily.get(key);
  if (!daily) {
    context.CreatedDaily.set({ id: key, date: day, dailyCount: 1, dex, exchange: event.params.exchange });
  } else {
    context.CreatedDaily.set({ ...daily, dailyCount: (daily.dailyCount || 0) + 1 });
  }

  const totalKey = chainPrefix + dex;
  let total = await context.CreatedTotal.get(totalKey);
  if (!total) {
    context.CreatedTotal.set({ id: totalKey, totalCount: 1 });
  } else {
    context.CreatedTotal.set({ ...total, totalCount: (total.totalCount || 0) + 1 });
  }

  // DAU
  const userAddress = event.params.maker.toLowerCase();
  let dau = await context.DailyActiveUsers.get(key);
  if (!dau) {
    context.DailyActiveUsers.set({ id: key, count: 1, userAddresses: [userAddress] });
  } else if (!dau.userAddresses.includes(userAddress)) {
    context.DailyActiveUsers.set({ ...dau, count: dau.count + 1, userAddresses: [...dau.userAddresses, userAddress] });
  }
});

TwapContract.OrderCompleted.handler(async ({ event, context }) => {
  const chainPrefix = `${event.chainId}-`;
  const orderId = event.params.id.toString();

  const entity = await context.Status.get(chainPrefix + orderId);
  if (entity) {
    context.Status.set({ ...entity, status: "COMPLETED" });
  }

  const idNew = chainPrefix + `${event.srcAddress}_${orderId}`;
  const entityNew = await context.StatusNew.get(idNew);
  if (entityNew) {
    context.StatusNew.set({ ...entityNew, status: "COMPLETED" });
  }
});

TwapContract.OrderCanceled.handler(async ({ event, context }) => {
  const chainPrefix = `${event.chainId}-`;
  const orderId = event.params.id.toString();

  const entity = await context.Status.get(chainPrefix + orderId);
  if (entity) {
    context.Status.set({ ...entity, status: "CANCELED" });
  }

  const idNew = chainPrefix + `${event.srcAddress}_${orderId}`;
  const entityNew = await context.StatusNew.get(idNew);
  if (entityNew) {
    context.StatusNew.set({ ...entityNew, status: "CANCELED" });
  }
});
