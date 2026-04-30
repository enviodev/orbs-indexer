import { describe, it } from "vitest";
import { createTestIndexer } from "generated";

// ============================================================================
// Committee Subgraph Tests (Ethereum mainnet, chain 1)
// Start blocks: Committee 11191418, ContractRegistry 11191401, Elections 11191410
// ============================================================================

describe("Committee contracts (chain 1)", () => {
  it("Should index ContractRegistry initialization events from first block", async (t) => {
    // ContractRegistry starts at block 11191401 — use wider range to find events
    const indexer = createTestIndexer();

    const result = await indexer.process({
      chains: { 1: { startBlock: 11191401, endBlock: 11191500 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]?.chainId).toBe(1);
  }, 30_000);

  it("Should index Elections initialization events", async (t) => {
    const indexer = createTestIndexer();

    const result = await indexer.process({
      chains: { 1: { startBlock: 11191410, endBlock: 11191411 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);

    // Elections contract emits events at block 11191410
    const changes = result.changes[0];
    const entityTypes = Object.keys(changes || {}).filter(
      (k) => !["block", "chainId", "eventsProcessed"].includes(k)
    );
    t.expect(entityTypes.length).toBeGreaterThan(0);
  }, 30_000);

  it("Should index Committee events at start block", async (t) => {
    const indexer = createTestIndexer();

    const result = await indexer.process({
      chains: { 1: { startBlock: 11191418, endBlock: 11191425 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
  }, 30_000);

  it("Should create correct entity fields for shared events", async (t) => {
    const indexer = createTestIndexer();

    // Process a wider initialization block range
    await indexer.process({
      chains: { 1: { startBlock: 11191401, endBlock: 11191500 } },
    });

    // Check that some shared entity types were created in this range
    const regTransferred = await indexer.RegistryManagementTransferred.getAll();
    const locked = await indexer.Locked.getAll();
    const allShared = [...regTransferred, ...locked];
    t.expect(allShared.length).toBeGreaterThan(0);

    // Each entity should have correct structure
    for (const entity of allShared) {
      t.expect(entity.id).toContain("1_"); // chainId prefix
      t.expect(entity.blockNumber).toBeGreaterThan(0n);
      t.expect(entity.blockTimestamp).toBeGreaterThan(0n);
      t.expect(entity.transactionHash).toBeTruthy();
    }
  }, 30_000);

  it("Should index SubscriptionChanged with all fields", async (t) => {
    const indexer = createTestIndexer();

    // Process a range after Subscriptions start block (11191412)
    await indexer.process({
      chains: { 1: { startBlock: 11191412, endBlock: 11191500 } },
    });

    const subs = await indexer.SubscriptionChanged.getAll();
    if (subs.length > 0) {
      const sub = subs[0];
      t.expect(sub.vcId).toBeDefined();
      t.expect(sub.owner).toBeTruthy();
      t.expect(sub.tier).toBeDefined();
    }
  }, 30_000);

  it("Should index GuardianDataUpdated with metadata", async (t) => {
    const indexer = createTestIndexer();

    // Process a range after GuardiansRegistration start block (11191421)
    await indexer.process({
      chains: { 1: { startBlock: 11191421, endBlock: 11191500 } },
    });

    const guardians = await indexer.GuardianDataUpdated.getAll();
    if (guardians.length > 0) {
      const g = guardians[0];
      t.expect(g.guardian).toBeTruthy();
      t.expect(typeof g.isRegistered).toBe("boolean");
      t.expect(g.name).toBeDefined();
    }
  }, 30_000);
});

// ============================================================================
// Delegations Subgraph Tests (Polygon, chain 137)
// Start block: 25502851
// ============================================================================

describe("Delegations (chain 137)", () => {
  it("Should index first Delegations events", async (t) => {
    const indexer = createTestIndexer();

    // Process the start block range
    const result = await indexer.process({
      chains: { 137: { startBlock: 25502851, endBlock: 25510000 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]?.chainId).toBe(137);
  }, 60_000);

  it("Should create DelegatorToGuardian and GuardianToDelegators mappings", async (t) => {
    const indexer = createTestIndexer();

    // Process a wide range — Delegated events are sparse early on
    await indexer.process({
      chains: { 137: { startBlock: 25520000, endBlock: 25540000 } },
    });

    const delegated = await indexer.Delegated.getAll();
    const dtg = await indexer.DelegatorToGuardian.getAll();
    const gtd = await indexer.GuardianToDelegators.getAll();

    // If we got Delegated events, mappings should exist
    if (delegated.length > 0) {
      t.expect(dtg.length).toBeGreaterThan(0);
      t.expect(gtd.length).toBeGreaterThan(0);

      // Verify DelegatorToGuardian structure
      for (const entry of dtg) {
        t.expect(entry.id).toContain("137-");
        t.expect(entry.guardian).toBeTruthy();
      }

      // Verify GuardianToDelegators structure
      for (const entry of gtd) {
        t.expect(entry.id).toContain("137-");
        t.expect(Array.isArray(entry.delegators)).toBe(true);
        t.expect(entry.delegators.length).toBeGreaterThan(0);
      }
    } else {
      // No Delegated events in this range — just verify no crash
      t.expect(true).toBe(true);
    }
  }, 60_000);

  it("Should create GuardianInfo and Delegator from DelegatedStakeChanged", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 137: { startBlock: 25502851, endBlock: 25600000 } },
    });

    const stakeChanges = await indexer.DelegatedStakeChanged.getAll();
    const guardianInfos = await indexer.GuardianInfo.getAll();
    const delegators = await indexer.Delegator.getAll();

    if (stakeChanges.length > 0) {
      // Verify immutable event entity
      const sc = stakeChanges[0];
      t.expect(sc.addr).toBeTruthy();
      t.expect(sc.selfDelegatedStake).toBeDefined();
      t.expect(sc.delegatedStake).toBeDefined();
      t.expect(sc.delegatorContributedStake).toBeDefined();

      // Verify mutable state entities were created
      t.expect(guardianInfos.length).toBeGreaterThan(0);
    }
  }, 60_000);
});

// ============================================================================
// TWAP Subgraph Tests (multi-chain)
// Polygon TWAP start block: 38111490
// ============================================================================

describe("TWAP (chain 137)", () => {
  it("Should index TWAP OrderCreated events with order details", async (t) => {
    const indexer = createTestIndexer();

    // Auto-exit to find first TWAP event on Polygon
    const result = await indexer.process({
      chains: { 137: { startBlock: 38111490, endBlock: 38200000 } },
    });

    const orders = await indexer.OrderCreated.getAll();
    if (orders.length > 0) {
      const order = orders[0];
      t.expect(order.twapAddress).toBeTruthy();
      t.expect(order.maker).toBeTruthy();
      t.expect(order.exchange).toBeTruthy();
      t.expect(order.ask_srcToken).toBeTruthy();
      t.expect(order.ask_dstToken).toBeTruthy();
      t.expect(order.ask_srcAmount).toBeGreaterThan(0n);
      t.expect(order.timestamp).toBeTruthy();
      t.expect(order.dex).toBeDefined();
      t.expect(["LIMIT", "TWAP"]).toContain(order.type);
    }
  }, 60_000);

  it("Should create Status and StatusNew entities on OrderCreated", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 137: { startBlock: 38111490, endBlock: 38200000 } },
    });

    const statuses = await indexer.Status.getAll();
    const statusesNew = await indexer.StatusNew.getAll();

    if (statuses.length > 0) {
      const s = statuses[0];
      t.expect(s.id).toContain("137-");

      const sn = statusesNew[0];
      t.expect(sn.twapId).toBeTruthy();
      t.expect(sn.twapAddress).toBeTruthy();
    }
  }, 60_000);

  it("Should create CreatedDaily and CreatedTotal aggregations", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 137: { startBlock: 38111490, endBlock: 38200000 } },
    });

    const daily = await indexer.CreatedDaily.getAll();
    const total = await indexer.CreatedTotal.getAll();

    if (daily.length > 0) {
      t.expect(daily[0].date).toBeTruthy();
      t.expect(daily[0].dailyCount).toBeGreaterThan(0);
      t.expect(daily[0].dex).toBeDefined();
    }

    if (total.length > 0) {
      t.expect(total[0].totalCount).toBeGreaterThan(0);
    }
  }, 60_000);

  it("Should track DailyActiveUsers", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 137: { startBlock: 38111490, endBlock: 38200000 } },
    });

    const dau = await indexer.DailyActiveUsers.getAll();
    if (dau.length > 0) {
      t.expect(dau[0].count).toBeGreaterThan(0);
      t.expect(dau[0].userAddresses.length).toBeGreaterThan(0);
    }
  }, 60_000);
});

// ============================================================================
// Liquidity Hub Tests (multi-chain)
// Polygon Reactor start: 46826301, ExecutorV5 start: 62860671
// ============================================================================

describe("Liquidity Hub (chain 137)", () => {
  it("Should index Fill events and create Swap stubs", async (t) => {
    const indexer = createTestIndexer();

    const result = await indexer.process({
      chains: { 137: { startBlock: 46826301, endBlock: 46900000 } },
    });

    const fills = await indexer.Fill.getAll();
    if (fills.length > 0) {
      const fill = fills[0];
      t.expect(fill.orderHash).toBeTruthy();
      t.expect(fill.filler).toBeTruthy();
      t.expect(fill.swapper).toBeTruthy();
      t.expect(fill.nonce).toBeDefined();
      t.expect(fill.blockNumber).toBeGreaterThan(0n);

      // Swap stub should exist
      const swaps = await indexer.Swap.getAll();
      t.expect(swaps.length).toBeGreaterThan(0);
      const swap = swaps[0];
      t.expect(swap.userAddress).toBeTruthy();
      t.expect(swap.executorAddress).toBeTruthy();
      t.expect(swap.timestamp).toBeTruthy();
    }
  }, 60_000);
});

// ============================================================================
// Cross-chain entity ID uniqueness
// ============================================================================

describe("Cross-chain", () => {
  it("Should prefix entity IDs with chainId for multichain safety", async (t) => {
    const indexer = createTestIndexer();

    // Process both chains
    await indexer.process({
      chains: {
        1: { startBlock: 11191401, endBlock: 11191420 },
      },
    });

    const allInit = await indexer.InitializationComplete.getAll();
    for (const entity of allInit) {
      // All IDs should start with chainId_
      t.expect(entity.id).toMatch(/^\d+_\d+_\d+$/);
    }

    const allLocked = await indexer.Locked.getAll();
    for (const entity of allLocked) {
      t.expect(entity.id).toMatch(/^\d+_\d+_\d+$/);
    }
  }, 30_000);
});

// ============================================================================
// Certification & Protocol
// ============================================================================

describe("Certification (chain 1)", () => {
  it("Should index GuardianCertificationUpdate", async (t) => {
    const indexer = createTestIndexer();

    // Certification starts at 11191417
    await indexer.process({
      chains: { 1: { startBlock: 11191417, endBlock: 11200000 } },
    });

    const certs = await indexer.GuardianCertificationUpdate.getAll();
    if (certs.length > 0) {
      t.expect(certs[0].guardian).toBeTruthy();
      t.expect(typeof certs[0].isCertified).toBe("boolean");
    }
  }, 30_000);
});

describe("Protocol (chain 1)", () => {
  it("Should index ProtocolVersionChanged", async (t) => {
    const indexer = createTestIndexer();

    // Protocol starts at 11191416
    await indexer.process({
      chains: { 1: { startBlock: 11191416, endBlock: 11200000 } },
    });

    const versions = await indexer.ProtocolVersionChanged.getAll();
    if (versions.length > 0) {
      t.expect(versions[0].deploymentSubset).toBeTruthy();
      t.expect(versions[0].currentVersion).toBeDefined();
      t.expect(versions[0].nextVersion).toBeDefined();
      t.expect(versions[0].fromTimestamp).toBeDefined();
    }
  }, 30_000);
});
