import { BlockList, isIP } from "node:net";
import { lookup } from "node:dns/promises";

import { parsePublicHostname } from "@/lib/domain";

const MAX_REDIRECTS = 5;

const privateAddresses = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  privateAddresses.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  privateAddresses.addSubnet(network, prefix, "ipv6");
}

export function isPrivateAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return true;
  return privateAddresses.check(address, family === 4 ? "ipv4" : "ipv6");
}

/** Throws unless the URL uses a public hostname, a default port and public addresses. */
async function assertPublicUrl(url: URL): Promise<void> {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Blocked URL scheme");
  }
  if (url.port !== "" || parsePublicHostname(url.hostname) === null) {
    throw new Error("Blocked URL host");
  }
  const addresses = await lookup(url.hostname, { all: true });
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new Error("Blocked private address");
  }
}

/**
 * Fetches a URL from user input and does the same checks at each redirect, so
 * a public site can not send the server to a private address.
 *
 * Limit: the check and the fetch do separate DNS lookups, so a DNS server that
 * changes its answer between them can still get past the check.
 */
export async function fetchPublicUrl(
  input: string,
  init: Omit<RequestInit, "redirect"> = {},
): Promise<Response> {
  let url = new URL(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url);
    const response = await fetch(url, { ...init, redirect: "manual" });
    const location = response.headers.get("location");
    if (response.status < 300 || response.status >= 400 || !location) {
      return response;
    }
    await response.body?.cancel();
    url = new URL(location, url);
  }
  throw new Error("Too many redirects");
}
