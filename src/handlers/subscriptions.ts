import { OrbsSubscriptions } from "generated";

OrbsSubscriptions.ContractRegistryAddressUpdated.handler(async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.GenesisRefTimeDelayChanged.handler(async ({ event, context }) => {
  context.GenesisRefTimeDelayChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newGenesisRefTimeDelay: event.params.newGenesisRefTimeDelay,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.InitializationComplete.handler(async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.Locked.handler(async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.MinimumInitialVcPaymentChanged.handler(async ({ event, context }) => {
  context.MinimumInitialVcPaymentChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newMinimumInitialVcPayment: event.params.newMinimumInitialVcPayment,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.Payment.handler(async ({ event, context }) => {
  context.Payment.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
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

OrbsSubscriptions.RegistryManagementTransferred.handler(async ({ event, context }) => {
  context.RegistryManagementTransferred.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    previousRegistryAdmin: event.params.previousRegistryAdmin,
    newRegistryAdmin: event.params.newRegistryAdmin,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.SubscriberAdded.handler(async ({ event, context }) => {
  context.SubscriberAdded.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    subscriber: event.params.subscriber,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.SubscriberRemoved.handler(async ({ event, context }) => {
  context.SubscriberRemoved.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    subscriber: event.params.subscriber,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.SubscriptionChanged.handler(async ({ event, context }) => {
  context.SubscriptionChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
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

OrbsSubscriptions.Unlocked.handler(async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.VcConfigRecordChanged.handler(async ({ event, context }) => {
  context.VcConfigRecordChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    vcId: event.params.vcId,
    key: event.params.key,
    value: event.params.value,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.VcCreated.handler(async ({ event, context }) => {
  context.VcCreated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    vcId: event.params.vcId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsSubscriptions.VcOwnerChanged.handler(async ({ event, context }) => {
  context.VcOwnerChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    vcId: event.params.vcId,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
