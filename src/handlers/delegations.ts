import { Delegations } from "generated";

// =============================================================================
// SIMPLE EVENT HANDLERS
// =============================================================================

Delegations.ContractRegistryAddressUpdated.handler(async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Delegations.DelegationInitialized.handler(async ({ event, context }) => {
  context.DelegationInitialized.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    from: event.params.sender,
    to: event.params.recipient,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Delegations.InitializationComplete.handler(async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Delegations.Locked.handler(async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Delegations.RegistryManagementTransferred.handler(async ({ event, context }) => {
  context.RegistryManagementTransferred.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    previousRegistryAdmin: event.params.previousRegistryAdmin,
    newRegistryAdmin: event.params.newRegistryAdmin,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Delegations.Unlocked.handler(async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

// =============================================================================
// COMPLEX HANDLERS
// =============================================================================

Delegations.Delegated.handler(async ({ event, context }) => {
  // 1. Create immutable Delegated entity
  context.Delegated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    from: event.params.sender,
    to: event.params.recipient,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const from = event.params.sender.toLowerCase();
  const to = event.params.recipient.toLowerCase();
  const chainPrefix = `${event.chainId}-`;

  // 2. Load existing delegator mapping
  let delegator = await context.DelegatorToGuardian.get(chainPrefix + from);
  if (delegator) {
    // Remove delegator from current guardian's list
    const currentGuardian = await context.GuardianToDelegators.get(
      chainPrefix + delegator.guardian
    );
    if (currentGuardian) {
      const delegators = currentGuardian.delegators.filter((d) => d !== from);
      context.GuardianToDelegators.set({ ...currentGuardian, delegators });
    }
  }

  // 3. Update delegator -> guardian mapping
  context.DelegatorToGuardian.set({
    id: chainPrefix + from,
    guardian: to,
  });

  // 4. Update guardian -> delegators mapping
  let guardian = await context.GuardianToDelegators.get(chainPrefix + to);
  if (!guardian) {
    context.GuardianToDelegators.set({
      id: chainPrefix + to,
      delegators: [from],
    });
  } else {
    const delegators = [...guardian.delegators];
    if (!delegators.includes(from)) {
      delegators.push(from);
    }
    context.GuardianToDelegators.set({ ...guardian, delegators });
  }
});

Delegations.DelegatedStakeChanged.handler(async ({ event, context }) => {
  // 1. Create immutable DelegatedStakeChanged entity
  const entityId = `${event.chainId}_${event.transaction.hash}_${event.logIndex}`;
  context.DelegatedStakeChanged.set({
    id: entityId,
    addr: event.params.addr,
    selfDelegatedStake: event.params.selfDelegatedStake,
    delegatedStake: event.params.delegatedStake,
    delegator: event.params.delegator,
    delegatorContributedStake: event.params.delegatorContributedStake,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const chainPrefix = `${event.chainId}-`;
  const guardianAddr = event.params.addr.toLowerCase();
  const delegatorAddr = event.params.delegator.toLowerCase();

  // 2. Load or create GuardianInfo
  let guardianInfo = await context.GuardianInfo.get(chainPrefix + guardianAddr);
  if (!guardianInfo) {
    guardianInfo = {
      id: chainPrefix + guardianAddr,
      nDelegates: 0n,
      delegatorMap_id: undefined,
    };
  }

  // 3. If delegator != guardian, update delegator entities
  if (delegatorAddr !== guardianAddr) {
    const dmId = chainPrefix + delegatorAddr;

    // Check if guardian already has a delegatorMap
    if (!guardianInfo.delegatorMap_id) {
      // New delegator map - increment delegate count
      guardianInfo = {
        ...guardianInfo,
        delegatorMap_id: dmId,
        nDelegates: guardianInfo.nDelegates + 1n,
      };
    }

    // Load or create Delegator
    let d = await context.Delegator.get(dmId);
    if (!d) {
      d = {
        id: dmId,
        lastChangeBlock: BigInt(event.block.number),
        lastChangeTime: BigInt(event.block.timestamp),
        address: delegatorAddr,
        stake: event.params.delegatorContributedStake,
        nonStake: 0n,
      };
    } else {
      d = {
        ...d,
        lastChangeBlock: BigInt(event.block.number),
        lastChangeTime: BigInt(event.block.timestamp),
        stake: event.params.delegatorContributedStake,
      };
    }
    context.Delegator.set(d);

    // Save DelegatorMap
    context.DelegatorMap.set({
      id: dmId,
      delegator_id: dmId,
    });
  }

  // 4. Save GuardianInfo
  context.GuardianInfo.set(guardianInfo);
});
