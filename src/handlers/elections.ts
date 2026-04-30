import { Elections } from "generated";

Elections.ContractRegistryAddressUpdated.handler(async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.GuardianStatusUpdated.handler(async ({ event, context }) => {
  context.GuardianStatusUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    guardian: event.params.guardian,
    readyToSync: event.params.readyToSync,
    readyForCommittee: event.params.readyForCommittee,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.GuardianVotedOut.handler(async ({ event, context }) => {
  context.GuardianVotedOut.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    guardian: event.params.guardian,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.GuardianVotedUnready.handler(async ({ event, context }) => {
  context.GuardianVotedUnready.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    guardian: event.params.guardian,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.InitializationComplete.handler(async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.Locked.handler(async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.MinSelfStakePercentMilleChanged.handler(async ({ event, context }) => {
  context.MinSelfStakePercentMilleChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.RegistryManagementTransferred.handler(async ({ event, context }) => {
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

Elections.StakeChanged.handler(async ({ event, context }) => {
  context.StakeChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    addr: event.params.addr,
    selfDelegatedStake: event.params.selfDelegatedStake,
    delegatedStake: event.params.delegatedStake,
    effectiveStake: event.params.effectiveStake,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.Unlocked.handler(async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.VoteOutCasted.handler(async ({ event, context }) => {
  context.VoteOutCasted.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    voter: event.params.voter,
    subject: event.params.subject,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.VoteOutPercentMilleThresholdChanged.handler(async ({ event, context }) => {
  context.VoteOutPercentMilleThresholdChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.VoteUnreadyCasted.handler(async ({ event, context }) => {
  context.VoteUnreadyCasted.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    voter: event.params.voter,
    subject: event.params.subject,
    expiration: event.params.expiration,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.VoteUnreadyPercentMilleThresholdChanged.handler(async ({ event, context }) => {
  context.VoteUnreadyPercentMilleThresholdChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Elections.VoteUnreadyTimeoutSecondsChanged.handler(async ({ event, context }) => {
  context.VoteUnreadyTimeoutSecondsChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
