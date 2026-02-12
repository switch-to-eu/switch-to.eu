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
 * These are not EU members but have close relationships with the EU
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
  ".at", // Austria
  ".be", // Belgium
  ".bg", // Bulgaria
  ".hr", // Croatia
  ".cy", // Cyprus
  ".cz", // Czech Republic
  ".dk", // Denmark
  ".ee", // Estonia
  ".fi", // Finland
  ".fr", // France
  ".de", // Germany
  ".gr", // Greece
  ".hu", // Hungary
  ".ie", // Ireland
  ".it", // Italy
  ".lv", // Latvia
  ".lt", // Lithuania
  ".lu", // Luxembourg
  ".mt", // Malta
  ".nl", // Netherlands
  ".pl", // Poland
  ".pt", // Portugal
  ".ro", // Romania
  ".sk", // Slovakia
  ".si", // Slovenia
  ".es", // Spain
  ".se", // Sweden
];

/**
 * Domain extensions (TLDs) for EU-friendly countries
 */
export const EU_FRIENDLY_TLDS = [
  ".ch", // Switzerland
  ".no", // Norway
  ".is", // Iceland
  ".li", // Liechtenstein
  ".uk", // United Kingdom
  ".mc", // Monaco
  ".sm", // San Marino
  ".va", // Vatican City
  ".ad", // Andorra
];

/**
 * Checks if a country is an EU member state
 * @param countryCode The ISO 3166-1 alpha-2 country code
 * @returns boolean indicating if the country is in the EU
 */
export function isEUCountry(countryCode?: string | null): boolean {
  if (!countryCode) return false;
  return EU_COUNTRIES.includes(countryCode.toUpperCase());
}

/**
 * Checks if a country is EU-friendly (EEA or has close ties with EU)
 * @param countryCode The ISO 3166-1 alpha-2 country code
 * @returns boolean indicating if the country is EU-friendly
 */
export function isEUFriendlyCountry(countryCode?: string | null): boolean {
  if (!countryCode) return false;
  return EU_FRIENDLY_COUNTRIES.includes(countryCode.toUpperCase());
}

/**
 * Returns both EU and EU-friendly status for a country
 * @param countryCode The ISO 3166-1 alpha-2 country code
 * @returns Object with isEU and euFriendly boolean values
 */
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

/**
 * Checks if a domain extension (TLD) belongs to an EU country
 * @param domain Domain name or extension to check
 * @returns boolean indicating if the domain has an EU extension
 */
export function isEUDomain(domain?: string | null): boolean {
  if (!domain) return false;

  // Extract the domain extension (TLD)
  const tld = extractTLD(domain);

  return EU_TLDS.some((euTld) => tld === euTld);
}

/**
 * Checks if a domain extension (TLD) belongs to an EU-friendly country
 * @param domain Domain name or extension to check
 * @returns boolean indicating if the domain has an EU-friendly extension
 */
export function isEUFriendlyDomain(domain?: string | null): boolean {
  if (!domain) return false;

  // Extract the domain extension (TLD)
  const tld = extractTLD(domain);

  return EU_FRIENDLY_TLDS.some((euFriendlyTld) => tld === euFriendlyTld);
}

/**
 * Returns both EU and EU-friendly status for a domain based on its extension
 * @param domain Domain name or extension to check
 * @returns Object with isEU and euFriendly boolean values
 */
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

/**
 * Helper function to extract the TLD from a domain name
 * @param domain Domain name or TLD
 * @returns Extracted TLD with dot prefix (e.g., ".com")
 */
function extractTLD(domain: string): string {
  // If it already starts with a dot, assume it's already a TLD
  if (domain.startsWith(".")) {
    return domain.toLowerCase();
  }

  // Remove protocol if present
  let cleanDomain = domain.replace(/^https?:\/\//i, "");

  // Remove path, query parameters, and hash if present
  cleanDomain = (cleanDomain.split("/")[0] ?? "").split("?")[0]?.split("#")[0] ?? "";

  // Extract the TLD (everything after the last dot)
  const lastDotIndex = cleanDomain.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return ""; // No dot found, not a valid domain with TLD
  }

  return cleanDomain.slice(lastDotIndex).toLowerCase();
}
