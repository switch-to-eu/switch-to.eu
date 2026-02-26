/**
 * Lightweight in-memory mock for the `redis` v4 package.
 * Implements the subset of RedisClientType methods used by our tRPC routers.
 * Use in vitest tests with vi.mock("@switch-to-eu/db/redis", ...).
 */
export class MockRedis {
  private hashes = new Map<string, Record<string, string>>();
  private sets = new Map<string, Set<string>>();
  private counters = new Map<string, number>();

  async hSet(key: string, data: Record<string, string>) {
    const existing = this.hashes.get(key) || {};
    this.hashes.set(key, { ...existing, ...data });
    return Object.keys(data).length;
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.hashes.get(key) || {};
  }

  async sMembers(key: string): Promise<string[]> {
    return Array.from(this.sets.get(key) || []);
  }

  async sCard(key: string): Promise<number> {
    return this.sets.get(key)?.size || 0;
  }

  async sAdd(key: string, member: string | string[]) {
    if (!this.sets.has(key)) this.sets.set(key, new Set());
    const members = Array.isArray(member) ? member : [member];
    for (const m of members) this.sets.get(key)!.add(m);
    return members.length;
  }

  async sRem(key: string, member: string | string[]) {
    const set = this.sets.get(key);
    if (!set) return 0;
    const members = Array.isArray(member) ? member : [member];
    let removed = 0;
    for (const m of members) {
      if (set.delete(m)) removed++;
    }
    if (set.size === 0) this.sets.delete(key);
    return removed;
  }

  async expireAt(_key: string, _timestamp: number) {
    return true;
  }

  async expire(_key: string, _seconds: number) {
    return true;
  }

  async pExpire(_key: string, _ms: number) {
    return true;
  }

  async del(keys: string | string[]) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    let deleted = 0;
    for (const key of keyArray) {
      if (this.hashes.delete(key) || this.sets.delete(key) || this.counters.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  async incr(key: string): Promise<number> {
    const current = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, current);
    return current;
  }

  async publish(_channel: string, _message: string) {
    return 0;
  }

  async ping() {
    return "PONG";
  }

  multi() {
    const commands: Array<() => Promise<unknown>> = [];
    const chain = {
      hSet: (key: string, data: Record<string, string>) => {
        commands.push(() => this.hSet(key, data));
        return chain;
      },
      expire: (key: string, seconds: number) => {
        commands.push(() => this.expire(key, seconds));
        return chain;
      },
      sAdd: (key: string, member: string) => {
        commands.push(() => this.sAdd(key, member));
        return chain;
      },
      exec: async () => {
        const results = [];
        for (const cmd of commands) results.push(await cmd());
        return results;
      },
    };
    return chain;
  }

  /** Reset all data between tests */
  _clear() {
    this.hashes.clear();
    this.sets.clear();
    this.counters.clear();
  }

  /** Inspect stored hash (for test assertions) */
  _getHash(key: string): Record<string, string> | undefined {
    return this.hashes.get(key);
  }

  /** Inspect stored set (for test assertions) */
  _getSet(key: string): Set<string> | undefined {
    return this.sets.get(key);
  }
}
