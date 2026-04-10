import { describe, it } from "vitest";
import { createTestIndexer } from "generated";

describe("Orbs Indexer", () => {
  it("Should process first block on Ethereum and create Committee entities", async (t) => {
    const indexer = createTestIndexer();

    const result = await indexer.process({ chains: { 1: {} } });

    // Verify events were processed
    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]?.chainId).toBe(1);
    t.expect(result.changes[0]?.eventsProcessed).toBeGreaterThan(0);

    // Verify specific entity types were created from Committee contracts
    // The first blocks contain InitializationComplete, RegistryManagementTransferred, etc.
    const changes = result.changes[0];
    const entityTypes = Object.keys(changes || {}).filter(
      (k) => !["block", "chainId", "eventsProcessed"].includes(k)
    );
    t.expect(entityTypes.length).toBeGreaterThan(0);
  }, 60_000);
});
