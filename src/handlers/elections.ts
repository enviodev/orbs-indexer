import { indexer } from "generated";

indexer.onEvent({ contract: "Elections", event: "ContractRegistryAddressUpdated" }, async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "GuardianStatusUpdated" }, async ({ event, context }) => {
  context.GuardianStatusUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    guardian: event.params.guardian,
    readyToSync: event.params.readyToSync,
    readyForCommittee: event.params.readyForCommittee,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "GuardianVotedOut" }, async ({ event, context }) => {
  context.GuardianVotedOut.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    guardian: event.params.guardian,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "GuardianVotedUnready" }, async ({ event, context }) => {
  context.GuardianVotedUnready.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    guardian: event.params.guardian,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "InitializationComplete" }, async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "Locked" }, async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "MinSelfStakePercentMilleChanged" }, async ({ event, context }) => {
  context.MinSelfStakePercentMilleChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "RegistryManagementTransferred" }, async ({ event, context }) => {
  context.RegistryManagementTransferred.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    previousRegistryAdmin: event.params.previousRegistryAdmin,
    newRegistryAdmin: event.params.newRegistryAdmin,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "StakeChanged" }, async ({ event, context }) => {
  context.StakeChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    addr: event.params.addr,
    selfDelegatedStake: event.params.selfDelegatedStake,
    delegatedStake: event.params.delegatedStake,
    effectiveStake: event.params.effectiveStake,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "Unlocked" }, async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "VoteOutCasted" }, async ({ event, context }) => {
  context.VoteOutCasted.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    voter: event.params.voter,
    subject: event.params.subject,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "VoteOutPercentMilleThresholdChanged" }, async ({ event, context }) => {
  context.VoteOutPercentMilleThresholdChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "VoteUnreadyCasted" }, async ({ event, context }) => {
  context.VoteUnreadyCasted.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    voter: event.params.voter,
    subject: event.params.subject,
    expiration: event.params.expiration,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "VoteUnreadyPercentMilleThresholdChanged" }, async ({ event, context }) => {
  context.VoteUnreadyPercentMilleThresholdChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Elections", event: "VoteUnreadyTimeoutSecondsChanged" }, async ({ event, context }) => {
  context.VoteUnreadyTimeoutSecondsChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
