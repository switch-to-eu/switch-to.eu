import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isHostOrSubdomain, parsePublicHostname } from "@/lib/domain";

const lookup = vi.hoisted(() => vi.fn());
vi.mock("node:dns/promises", () => ({ lookup, default: { lookup } }));

const { fetchPublicUrl, isPrivateAddress } = await import(
  "@/server/lib/public-fetch"
);

describe("parsePublicHostname", () => {
  it.each([
    ["example.com", "example.com"],
    ["  EXAMPLE.com. ", "example.com"],
    ["https://www.example.com/a?b=1", "www.example.com"],
    ["http://example.co.uk:8080", "example.co.uk"],
    ["bücher.example", "xn--bcher-kva.example"],
  ])("accepts %s", (input, expected) => {
    expect(parsePublicHostname(input)).toBe(expected);
  });

  it.each([
    "",
    "localhost",
    "foo.localhost",
    "printer.local",
    "metadata.internal",
    "127.0.0.1",
    "169.254.169.254",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]/",
    "http://2130706433/",
    "file:///etc/passwd",
    "ftp://example.com",
    "single-label",
    "exa mple.com",
  ])("rejects %s", (input) => {
    expect(parsePublicHostname(input)).toBeNull();
  });
});

describe("isHostOrSubdomain", () => {
  it("matches the domain and its subdomains, with a final dot", () => {
    expect(isHostOrSubdomain("cloudfront.net", "cloudfront.net")).toBe(true);
    expect(isHostOrSubdomain("a.CloudFront.net.", "cloudfront.net")).toBe(true);
  });

  it("does not match a name that only contains the domain", () => {
    expect(isHostOrSubdomain("cloudfront.net.evil.com", "cloudfront.net")).toBe(false);
    expect(isHostOrSubdomain("evilcloudfront.net", "cloudfront.net")).toBe(false);
  });
});

describe("isPrivateAddress", () => {
  it.each(["10.0.0.1", "127.0.0.1", "169.254.169.254", "192.168.1.1", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "nonsense"])(
    "blocks %s",
    (address) => {
      expect(isPrivateAddress(address)).toBe(true);
    },
  );

  it.each(["93.184.216.34", "2606:2800:220:1::1"])("allows %s", (address) => {
    expect(isPrivateAddress(address)).toBe(false);
  });
});

describe("fetchPublicUrl", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    lookup.mockReset();
    lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("follows a redirect to a public site", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(null, { status: 301, headers: { location: "https://www.example.com/" } }),
      )
      .mockResolvedValueOnce(new Response("ok"));

    const response = await fetchPublicUrl("https://example.com");

    expect(await response.text()).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not fetch a host that resolves to a private address", async () => {
    lookup.mockResolvedValue([{ address: "169.254.169.254", family: 4 }]);

    await expect(fetchPublicUrl("https://rebind.example.com")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["http://169.254.169.254/latest/meta-data", "http://localhost/", "https://example.com:8080/"])(
    "does not follow a redirect to %s",
    async (location) => {
      fetchMock.mockResolvedValueOnce(
        new Response(null, { status: 302, headers: { location } }),
      );

      await expect(fetchPublicUrl("https://example.com")).rejects.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it("stops after too many redirects", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(null, { status: 302, headers: { location: "https://example.com/" } }),
      ),
    );

    await expect(fetchPublicUrl("https://example.com")).rejects.toThrow("Too many redirects");
  });
});
