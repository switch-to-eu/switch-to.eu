const HOSTNAME =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Names that point to a private network, not to a public website. */
const PRIVATE_SUFFIXES = [
  "localhost",
  "local",
  "internal",
  "intranet",
  "lan",
  "home.arpa",
  "in-addr.arpa",
  "ip6.arpa",
];

/** True when `host` is `domain` or a subdomain of `domain`. Ignores a final dot. */
export function isHostOrSubdomain(host: string, domain: string): boolean {
  const name = host.toLowerCase().replace(/\.$/, "");
  return name === domain || name.endsWith(`.${domain}`);
}

/**
 * Returns the public hostname in user input such as `https://www.example.com/a`,
 * or null. The last label must start with a letter, so IP addresses give null.
 */
export function parsePublicHostname(input: string): string | null {
  const value = input.trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
    ? value
    : `https://${value}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!HOSTNAME.test(host)) return null;
  if (PRIVATE_SUFFIXES.some((suffix) => isHostOrSubdomain(host, suffix))) {
    return null;
  }
  return host;
}
