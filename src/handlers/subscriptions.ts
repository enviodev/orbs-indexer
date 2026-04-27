import { indexer } from "generated";

indexer.onEvent({ contract: "OrbsSubscriptions", event: "ContractRegistryAddressUpdated" }, async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "GenesisRefTimeDelayChanged" }, async ({ event, context }) => {
  context.GenesisRefTimeDelayChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    newGenesisRefTimeDelay: event.params.newGenesisRefTimeDelay,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "InitializationComplete" }, async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "Locked" }, async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "MinimumInitialVcPaymentChanged" }, async ({ event, context }) => {
  context.MinimumInitialVcPaymentChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    newMinimumInitialVcPayment: event.params.newMinimumInitialVcPayment,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "Payment" }, async ({ event, context }) => {
  context.Payment.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    vcId: event.params.vcId,
    by: event.params.by,
    amount: event.params.amount,
    tier: event.params.tier,
    rate: event.params.rate,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "RegistryManagementTransferred" }, async ({ event, context }) => {
  context.RegistryManagementTransferred.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    previousRegistryAdmin: event.params.previousRegistryAdmin,
    newRegistryAdmin: event.params.newRegistryAdmin,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "SubscriberAdded" }, async ({ event, context }) => {
  context.SubscriberAdded.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    subscriber: event.params.subscriber,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "SubscriberRemoved" }, async ({ event, context }) => {
  context.SubscriberRemoved.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    subscriber: event.params.subscriber,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "SubscriptionChanged" }, async ({ event, context }) => {
  context.SubscriptionChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    vcId: event.params.vcId,
    owner: event.params.owner,
    name: event.params.name,
    genRefTime: event.params.genRefTime,
    tier: event.params.tier,
    rate: event.params.rate,
    expiresAt: event.params.expiresAt,
    isCertified: event.params.isCertified,
    deploymentSubset: event.params.deploymentSubset,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "Unlocked" }, async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "VcConfigRecordChanged" }, async ({ event, context }) => {
  context.VcConfigRecordChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    vcId: event.params.vcId,
    key: event.params.key,
    value: event.params.value,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "VcCreated" }, async ({ event, context }) => {
  context.VcCreated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    vcId: event.params.vcId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsSubscriptions", event: "VcOwnerChanged" }, async ({ event, context }) => {
  context.VcOwnerChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    vcId: event.params.vcId,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
