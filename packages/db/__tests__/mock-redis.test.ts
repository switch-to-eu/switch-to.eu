import { describe, it, expect, beforeEach } from "vitest";
import { MockRedis } from "../src/mock-redis";

describe("MockRedis", () => {
  let redis: MockRedis;

  beforeEach(() => {
    redis = new MockRedis();
  });

  // --- Hash commands ---

  describe("hSet / hGetAll", () => {
    it("stores and retrieves a hash", async () => {
      await redis.hSet("h1", { a: "1", b: "2" });
      expect(await redis.hGetAll("h1")).toEqual({ a: "1", b: "2" });
    });

    it("merges fields on subsequent hSet calls", async () => {
      await redis.hSet("h1", { a: "1" });
      await redis.hSet("h1", { b: "2" });
      expect(await redis.hGetAll("h1")).toEqual({ a: "1", b: "2" });
    });

    it("overwrites existing fields", async () => {
      await redis.hSet("h1", { a: "old" });
      await redis.hSet("h1", { a: "new" });
      expect(await redis.hGetAll("h1")).toEqual({ a: "new" });
    });

    it("returns empty object for non-existent hash", async () => {
      expect(await redis.hGetAll("missing")).toEqual({});
    });
  });

  // --- Set commands ---

  describe("sAdd / sMembers / sCard / sRem / sIsMember", () => {
    it("adds and retrieves set members", async () => {
      await redis.sAdd("s1", "a");
      await redis.sAdd("s1", "b");
      const members = await redis.sMembers("s1");
      expect(members.sort()).toEqual(["a", "b"]);
    });

    it("sAdd accepts array", async () => {
      await redis.sAdd("s1", ["x", "y", "z"]);
      expect(await redis.sCard("s1")).toBe(3);
    });

    it("deduplicates members", async () => {
      await redis.sAdd("s1", "a");
      await redis.sAdd("s1", "a");
      expect(await redis.sCard("s1")).toBe(1);
    });

    it("removes members", async () => {
      await redis.sAdd("s1", ["a", "b", "c"]);
      await redis.sRem("s1", "b");
      expect(await redis.sMembers("s1")).not.toContain("b");
      expect(await redis.sCard("s1")).toBe(2);
    });

    it("sRem accepts array", async () => {
      await redis.sAdd("s1", ["a", "b", "c"]);
      await redis.sRem("s1", ["a", "c"]);
      expect(await redis.sMembers("s1")).toEqual(["b"]);
    });

    it("sRem cleans up empty sets", async () => {
      await redis.sAdd("s1", "a");
      await redis.sRem("s1", "a");
      expect(redis._getSet("s1")).toBeUndefined();
    });

    it("sIsMember checks membership", async () => {
      await redis.sAdd("s1", "a");
      expect(await redis.sIsMember("s1", "a")).toBe(true);
      expect(await redis.sIsMember("s1", "b")).toBe(false);
      expect(await redis.sIsMember("missing", "a")).toBe(false);
    });

    it("returns 0 for sCard on missing key", async () => {
      expect(await redis.sCard("missing")).toBe(0);
    });
  });

  // --- List commands ---

  describe("rPush / lLen / lRange", () => {
    it("pushes and retrieves list items", async () => {
      await redis.rPush("l1", "a");
      await redis.rPush("l1", "b");
      expect(await redis.lRange("l1", 0, -1)).toEqual(["a", "b"]);
    });

    it("rPush accepts array", async () => {
      await redis.rPush("l1", ["x", "y"]);
      expect(await redis.lLen("l1")).toBe(2);
    });

    it("lRange with specific bounds", async () => {
      await redis.rPush("l1", ["a", "b", "c", "d"]);
      expect(await redis.lRange("l1", 1, 2)).toEqual(["b", "c"]);
    });

    it("returns empty for missing list", async () => {
      expect(await redis.lRange("missing", 0, -1)).toEqual([]);
      expect(await redis.lLen("missing")).toBe(0);
    });
  });

  // --- String commands ---

  describe("get / set", () => {
    it("stores and retrieves strings", async () => {
      await redis.set("k1", "v1");
      expect(await redis.get("k1")).toBe("v1");
    });

    it("returns null for missing key", async () => {
      expect(await redis.get("missing")).toBeNull();
    });

    it("overwrites existing value", async () => {
      await redis.set("k1", "old");
      await redis.set("k1", "new");
      expect(await redis.get("k1")).toBe("new");
    });
  });

  // --- Counter ---

  describe("incr", () => {
    it("increments from 0", async () => {
      expect(await redis.incr("c1")).toBe(1);
      expect(await redis.incr("c1")).toBe(2);
      expect(await redis.incr("c1")).toBe(3);
    });

    it("tracks independent counters", async () => {
      await redis.incr("a");
      await redis.incr("a");
      await redis.incr("b");
      expect(await redis.incr("a")).toBe(3);
      expect(await redis.incr("b")).toBe(2);
    });
  });

  // --- Deletion ---

  describe("del", () => {
    it("deletes a single key", async () => {
      await redis.set("k1", "v1");
      expect(await redis.del("k1")).toBe(1);
      expect(await redis.get("k1")).toBeNull();
    });

    it("deletes multiple keys", async () => {
      await redis.set("k1", "v1");
      await redis.hSet("h1", { a: "1" });
      expect(await redis.del(["k1", "h1"])).toBe(2);
    });

    it("returns 0 for non-existent key", async () => {
      expect(await redis.del("nope")).toBe(0);
    });

    it("also clears TTL on deletion", async () => {
      await redis.set("k1", "v1");
      await redis.expire("k1", 60);
      await redis.del("k1");
      expect(redis._getTtl("k1")).toBeUndefined();
    });
  });

  // --- TTL ---

  describe("expire / expireAt / pExpire", () => {
    it("expire stores TTL in seconds", async () => {
      await redis.hSet("h1", { a: "1" });
      await redis.expire("h1", 300);
      expect(redis._getTtl("h1")).toBe(300);
    });

    it("expireAt and pExpire return true", async () => {
      expect(await redis.expireAt("k", 999999)).toBe(true);
      expect(await redis.pExpire("k", 5000)).toBe(true);
    });
  });

  // --- Transactions ---

  describe("multi", () => {
    it("executes queued commands in order", async () => {
      const results = await redis
        .multi()
        .hSet("h1", { a: "1" })
        .expire("h1", 60)
        .sAdd("s1", "x")
        .set("k1", "v1")
        .rPush("l1", "item")
        .exec();

      expect(results).toHaveLength(5);
      expect(await redis.hGetAll("h1")).toEqual({ a: "1" });
      expect(redis._getTtl("h1")).toBe(60);
      expect(await redis.sMembers("s1")).toEqual(["x"]);
      expect(await redis.get("k1")).toBe("v1");
      expect(await redis.lRange("l1", 0, -1)).toEqual(["item"]);
    });
  });

  // --- Pub/Sub ---

  describe("publish", () => {
    it("returns 0 (stub)", async () => {
      expect(await redis.publish("chan", "msg")).toBe(0);
    });
  });

  // --- ping ---

  describe("ping", () => {
    it("returns PONG", async () => {
      expect(await redis.ping()).toBe("PONG");
    });
  });

  // --- eval (Lua script mock) ---

  describe("eval", () => {
    it("handles submitAnswer script: stores answer and returns position", async () => {
      const script = `if redis.call("HEXISTS", ...) then ... RPUSH ...`;
      const result = await redis.eval(script, {
        keys: ["quiz:1:a:0:sess1", "quiz:1:order:0"],
        arguments: ["enc-answer", "2025-01-01T00:00:00Z", "3600", "sess1"],
      });

      expect(result).toBe(1);
      expect(redis._getHash("quiz:1:a:0:sess1")).toEqual({
        encryptedAnswer: "enc-answer",
        answeredAt: "2025-01-01T00:00:00Z",
      });
      expect(redis._getList("quiz:1:order:0")).toEqual(["sess1"]);
    });

    it("handles submitAnswer script: rejects duplicate", async () => {
      await redis.hSet("quiz:1:a:0:sess1", { encryptedAnswer: "existing" });

      const script = `if redis.call("HEXISTS", ...) then ... RPUSH ...`;
      const result = await redis.eval(script, {
        keys: ["quiz:1:a:0:sess1", "quiz:1:order:0"],
        arguments: ["new-answer", "2025-01-01T00:00:00Z", "3600", "sess1"],
      });

      expect(result).toBe(-1);
    });

    it("throws for unrecognized scripts", async () => {
      await expect(
        redis.eval("SELECT 1", { keys: [], arguments: [] }),
      ).rejects.toThrow("unrecognized script");
    });
  });

  // --- _clear ---

  describe("_clear", () => {
    it("resets all data stores", async () => {
      await redis.hSet("h1", { a: "1" });
      await redis.sAdd("s1", "x");
      await redis.set("k1", "v1");
      await redis.rPush("l1", "item");
      await redis.incr("c1");
      await redis.expire("h1", 60);

      redis._clear();

      expect(await redis.hGetAll("h1")).toEqual({});
      expect(await redis.sMembers("s1")).toEqual([]);
      expect(await redis.get("k1")).toBeNull();
      expect(await redis.lRange("l1", 0, -1)).toEqual([]);
      expect(await redis.incr("c1")).toBe(1); // restarted
      expect(redis._getTtl("h1")).toBeUndefined();
    });
  });
});
