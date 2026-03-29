import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "@switch-to-eu/db/mock-redis";

const mockRedis = new MockRedis();

vi.mock("@switch-to-eu/db/redis", () => ({
  getRedis: () => mockRedis,
  getRedisSubscriber: () => mockRedis,
}));

const { createCaller } = await import("@/server/api/root");

const caller = createCaller({
  redis: mockRedis as never,
  headers: new Headers(),
});

/** Helper: create a board with default columns */
async function createBoard(columnCount = 1, expirationDays?: number) {
  const columns = Array.from({ length: columnCount }, (_, i) => ({
    encryptedMeta: `encrypted-meta-${i + 1}`,
    encryptedCards: `encrypted-empty-cards-${i + 1}`,
  }));
  return caller.board.create({
    encryptedData: "encrypted-board-data",
    columns,
    expirationDays,
  });
}

describe("board router", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  describe("create", () => {
    it("should create a board with columns", async () => {
      const result = await createBoard(3, 30);

      expect(result.board.id).toHaveLength(10);
      expect(result.board.encryptedData).toBe("encrypted-board-data");
      expect(result.board.columnOrder).toHaveLength(3);
      expect(result.board.version).toBe(1);
      expect(result.columns).toHaveLength(3);
      expect(result.columns[0]!.encryptedMeta).toBe("encrypted-meta-1");
      expect(result.columns[0]!.encryptedCards).toBe("encrypted-empty-cards-1");
      expect(result.columns[0]!.version).toBe(1);
      expect(result.adminToken).toBeTruthy();
    });
  });

  describe("get", () => {
    it("should fetch a board with columns", async () => {
      const created = await createBoard(2);

      const fetched = await caller.board.get({ id: created.board.id });

      expect(fetched.board.id).toBe(created.board.id);
      expect(fetched.columns).toHaveLength(2);
      expect(fetched.columns[0]!.encryptedMeta).toBe("encrypted-meta-1");
      expect(fetched.columns[0]!.encryptedCards).toBe("encrypted-empty-cards-1");
    });

    it("should throw NOT_FOUND for invalid board ID", async () => {
      await expect(
        caller.board.get({ id: "AAAAAAAAAA" }),
      ).rejects.toThrow("Board not found");
    });
  });

  describe("updateCards", () => {
    it("should update cards in a single column", async () => {
      const created = await createBoard(1);
      const columnId = created.board.columnOrder[0]!;

      await caller.board.updateCards({
        boardId: created.board.id,
        columns: [
          {
            columnId,
            encryptedCards: "encrypted-cards-with-new-card",
            expectedVersion: 1,
          },
        ],
      });

      const fetched = await caller.board.get({ id: created.board.id });
      const col = fetched.columns.find((c) => c.id === columnId);
      expect(col?.encryptedCards).toBe("encrypted-cards-with-new-card");
      expect(col?.version).toBe(2);
    });

    it("should update cards in two columns atomically (cross-column move)", async () => {
      const created = await createBoard(2);
      const [col1Id, col2Id] = created.board.columnOrder;

      await caller.board.updateCards({
        boardId: created.board.id,
        columns: [
          {
            columnId: col1Id!,
            encryptedCards: "encrypted-col1-updated",
            expectedVersion: 1,
          },
          {
            columnId: col2Id!,
            encryptedCards: "encrypted-col2-updated",
            expectedVersion: 1,
          },
        ],
      });

      const fetched = await caller.board.get({ id: created.board.id });
      const c1 = fetched.columns.find((c) => c.id === col1Id);
      const c2 = fetched.columns.find((c) => c.id === col2Id);
      expect(c1?.encryptedCards).toBe("encrypted-col1-updated");
      expect(c1?.version).toBe(2);
      expect(c2?.encryptedCards).toBe("encrypted-col2-updated");
      expect(c2?.version).toBe(2);
    });

    it("should reject version mismatch (optimistic concurrency)", async () => {
      const created = await createBoard(1);
      const columnId = created.board.columnOrder[0]!;

      // First update succeeds
      await caller.board.updateCards({
        boardId: created.board.id,
        columns: [{ columnId, encryptedCards: "v2", expectedVersion: 1 }],
      });

      // Second update with stale version fails
      await expect(
        caller.board.updateCards({
          boardId: created.board.id,
          columns: [{ columnId, encryptedCards: "v3", expectedVersion: 1 }],
        }),
      ).rejects.toThrow("Column has been modified");
    });
  });

  describe("delete", () => {
    it("should delete a board with admin token", async () => {
      const created = await createBoard(1);

      await caller.board.delete({
        id: created.board.id,
        adminToken: created.adminToken,
      });

      await expect(
        caller.board.get({ id: created.board.id }),
      ).rejects.toThrow("Board not found");
    });

    it("should reject invalid admin token", async () => {
      const created = await createBoard(1);

      await expect(
        caller.board.delete({
          id: created.board.id,
          adminToken: "wrong-token",
        }),
      ).rejects.toThrow();
    });
  });

  describe("addColumn", () => {
    it("should add a column with admin token", async () => {
      const created = await createBoard(1);

      const newCol = await caller.board.addColumn({
        boardId: created.board.id,
        adminToken: created.adminToken,
        encryptedMeta: "new-col-meta",
        encryptedCards: "new-col-empty-cards",
      });

      expect(newCol.id).toHaveLength(8);
      expect(newCol.encryptedMeta).toBe("new-col-meta");
      expect(newCol.encryptedCards).toBe("new-col-empty-cards");

      const fetched = await caller.board.get({ id: created.board.id });
      expect(fetched.columns).toHaveLength(2);
      expect(fetched.board.columnOrder).toContain(newCol.id);
    });

    it("should reject invalid admin token", async () => {
      const created = await createBoard(1);

      await expect(
        caller.board.addColumn({
          boardId: created.board.id,
          adminToken: "wrong-token",
          encryptedMeta: "new-col-meta",
          encryptedCards: "new-col-empty-cards",
        }),
      ).rejects.toThrow();
    });
  });

  describe("updateColumn", () => {
    it("should update column meta with admin token", async () => {
      const created = await createBoard(1);
      const columnId = created.board.columnOrder[0]!;

      const updated = await caller.board.updateColumn({
        boardId: created.board.id,
        columnId,
        adminToken: created.adminToken,
        encryptedMeta: "updated-meta",
      });

      expect(updated.encryptedMeta).toBe("updated-meta");
      expect(updated.version).toBe(2);
      // encryptedCards should be preserved
      expect(updated.encryptedCards).toBe("encrypted-empty-cards-1");
    });

    it("should reject invalid admin token", async () => {
      const created = await createBoard(1);

      await expect(
        caller.board.updateColumn({
          boardId: created.board.id,
          columnId: created.board.columnOrder[0]!,
          adminToken: "wrong-token",
          encryptedMeta: "updated-meta",
        }),
      ).rejects.toThrow();
    });
  });

  describe("removeColumn", () => {
    it("should remove a column", async () => {
      const created = await createBoard(2);
      const colToRemove = created.board.columnOrder[0]!;

      await caller.board.removeColumn({
        boardId: created.board.id,
        columnId: colToRemove,
        adminToken: created.adminToken,
      });

      const fetched = await caller.board.get({ id: created.board.id });
      expect(fetched.columns).toHaveLength(1);
      expect(fetched.board.columnOrder).not.toContain(colToRemove);
    });

    it("should reject invalid admin token", async () => {
      const created = await createBoard(2);

      await expect(
        caller.board.removeColumn({
          boardId: created.board.id,
          columnId: created.board.columnOrder[0]!,
          adminToken: "wrong-token",
        }),
      ).rejects.toThrow();
    });
  });

  describe("reorderColumns", () => {
    it("should reorder columns with admin token", async () => {
      const created = await createBoard(3);
      const reversed = [...created.board.columnOrder].reverse();

      const result = await caller.board.reorderColumns({
        boardId: created.board.id,
        adminToken: created.adminToken,
        columnOrder: reversed,
      });

      expect(result.columnOrder).toEqual(reversed);

      const fetched = await caller.board.get({ id: created.board.id });
      expect(fetched.board.columnOrder).toEqual(reversed);
    });

    it("should reject invalid admin token", async () => {
      const created = await createBoard(2);

      await expect(
        caller.board.reorderColumns({
          boardId: created.board.id,
          adminToken: "wrong-token",
          columnOrder: [...created.board.columnOrder].reverse(),
        }),
      ).rejects.toThrow();
    });

    it("should reject mismatched column IDs", async () => {
      const created = await createBoard(2);

      await expect(
        caller.board.reorderColumns({
          boardId: created.board.id,
          adminToken: created.adminToken,
          columnOrder: ["AAAAAAAA", "BBBBBBBB"],
        }),
      ).rejects.toThrow("Column order must contain the same columns");
    });
  });
});
