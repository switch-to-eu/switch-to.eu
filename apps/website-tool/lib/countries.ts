/**
 * EU country codes based on ISO 3166-1 alpha-2 standard
 */
export const EU_COUNTRIES = [
  "AT", // Austria
  "BE", // Belgium
  "BG", // Bulgaria
  "HR", // Croatia
  "CY", // Cyprus
  "CZ", // Czech Republic
  "DK", // Denmark
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IE", // Ireland
  "IT", // Italy
  "LV", // Latvia
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "NL", // Netherlands
  "PL", // Poland
  "PT", // Portugal
  "RO", // Romania
  "SK", // Slovakia
  "SI", // Slovenia
  "ES", // Spain
  "SE", // Sweden
];

/**
 * EEA (European Economic Area) and other EU-friendly countries
 */
export const EU_FRIENDLY_COUNTRIES = [
  "CH", // Switzerland
  "NO", // Norway
  "IS", // Iceland
  "LI", // Liechtenstein
  "UK", // United Kingdom
  "MC", // Monaco
  "SM", // San Marino
  "VA", // Vatican City
  "AD", // Andorra
];

/**
 * Domain extensions (TLDs) for EU countries
 */
export const EU_TLDS = [
  ".eu",
  ".at", ".be", ".bg", ".hr", ".cy", ".cz", ".dk", ".ee", ".fi",
  ".fr", ".de", ".gr", ".hu", ".ie", ".it", ".lv", ".lt", ".lu",
  ".mt", ".nl", ".pl", ".pt", ".ro", ".sk", ".si", ".es", ".se",
];

/**
 * Domain extensions (TLDs) for EU-friendly countries
 */
export const EU_FRIENDLY_TLDS = [
  ".ch", ".no", ".is", ".li", ".uk", ".mc", ".sm", ".va", ".ad",
];

export function isEUCountry(countryCode?: string | null): boolean {
  if (!countryCode) return false;
  return EU_COUNTRIES.includes(countryCode.toUpperCase());
}

export function isEUFriendlyCountry(countryCode?: string | null): boolean {
  if (!countryCode) return false;
  return EU_FRIENDLY_COUNTRIES.includes(countryCode.toUpperCase());
}

export function getCountryEUStatus(countryCode?: string | null): {
  isEU: boolean;
  euFriendly: boolean;
} {
  if (!countryCode) return { isEU: false, euFriendly: false };

  const code = countryCode.toUpperCase();
  return {
    isEU: EU_COUNTRIES.includes(code),
    euFriendly: EU_FRIENDLY_COUNTRIES.includes(code),
  };
}

export function isEUDomain(domain?: string | null): boolean {
  if (!domain) return false;
  const tld = extractTLD(domain);
  return EU_TLDS.some((euTld) => tld === euTld);
}

export function isEUFriendlyDomain(domain?: string | null): boolean {
  if (!domain) return false;
  const tld = extractTLD(domain);
  return EU_FRIENDLY_TLDS.some((euFriendlyTld) => tld === euFriendlyTld);
}

export function getDomainEUStatus(domain?: string | null): {
  isEU: boolean;
  euFriendly: boolean;
} {
  if (!domain) return { isEU: false, euFriendly: false };

  const tld = extractTLD(domain);

  return {
    isEU: EU_TLDS.some((euTld) => tld === euTld),
    euFriendly: EU_FRIENDLY_TLDS.some((euFriendlyTld) => tld === euFriendlyTld),
  };
}

function extractTLD(domain: string): string {
  if (domain.startsWith(".")) {
    return domain.toLowerCase();
  }

  let cleanDomain = domain.replace(/^https?:\/\//i, "");
  cleanDomain = (cleanDomain.split("/")[0] ?? "").split("?")[0]?.split("#")[0] ?? "";

  const lastDotIndex = cleanDomain.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }

  return cleanDomain.slice(lastDotIndex).toLowerCase();
}
