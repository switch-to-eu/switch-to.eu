import { NextRequest, NextResponse } from "next/server";
import { getFromRedis, setInRedis } from "@/lib/redis";
import { AnalysisStep } from "@/lib/types";
import { getAllDnsRecords } from "@layered/dns-records";
import { whoisDomain, whoisIp } from "whoiser";

// Email provider detection from real MX records
async function detectEmailProvider(domain: string) {
  try {
    const dnsRecords = await getAllDnsRecords(domain);
    const mxRecords = dnsRecords.filter((record) => record.type === "MX");

    // If no MX records found, return unknown
    if (!mxRecords || mxRecords.length === 0) {
      return { provider: "No email provider detected", isEU: null };
    }

    // Sort MX records by priority (lowest first)
    const sortedMX = mxRecords.sort((a, b) => {
      // Extract priority from MX record value (e.g., "10 example.com")
      const priorityA = parseInt(a.data.split(" ")[0], 10);
      const priorityB = parseInt(b.data.split(" ")[0], 10);
      return priorityA - priorityB;
    });

    // Extract domain part from MX records for easier matching
    const mxDomains = sortedMX.map((record) => {
      const parts = record.data.split(" ");
      if (parts.length > 1) {
        return parts[1].toLowerCase();
      }
      return record.data.toLowerCase();
    });

    // Match patterns in MX records to identify providers
    if (
      mxDomains.some(
        (mx) =>
          mx.includes("google") ||
          mx.includes("gmail") ||
          mx.includes("googlemail")
      )
    ) {
      return { provider: "Google Workspace", isEU: false };
    } else if (
      mxDomains.some(
        (mx) =>
          mx.includes("outlook") ||
          mx.includes("hotmail") ||
          mx.includes("microsoft")
      )
    ) {
      return { provider: "Microsoft 365", isEU: false };
    } else if (mxDomains.some((mx) => mx.includes("zoho"))) {
      return { provider: "Zoho Mail", isEU: false };
    } else if (mxDomains.some((mx) => mx.includes("infomaniak"))) {
      return { provider: "Infomaniak", isEU: true };
    } else if (mxDomains.some((mx) => mx.includes("mailbox.org"))) {
      return { provider: "Mailbox.org", isEU: true };
    } else if (
      mxDomains.some((mx) => mx.includes("proton") || mx.includes("protonmail"))
    ) {
      return { provider: "Proton Mail", isEU: true };
    } else if (mxDomains.some((mx) => mx.includes("ovh"))) {
      return { provider: "OVH", isEU: true };
    } else if (mxDomains.some((mx) => mx.includes("cloudflare"))) {
      return { provider: "Cloudflare", isEU: false };
    } else if (mxDomains.some((mx) => mx.includes("ionos"))) {
      return { provider: "IONOS", isEU: true };
    } else if (mxDomains.some((mx) => mx.includes("hetzner"))) {
      return { provider: "Hetzner", isEU: true };
    } else if (mxDomains.some((mx) => mx.includes("gandi"))) {
      return { provider: "Gandi", isEU: true };
    } else {
      // Check for common hosting patterns or return the first MX domain
      const firstMxDomain = mxDomains[0];
      if (firstMxDomain) {
        const domainParts = firstMxDomain.split(".");
        if (domainParts.length >= 2) {
          const provider =
            domainParts[domainParts.length - 2].charAt(0).toUpperCase() +
            domainParts[domainParts.length - 2].slice(1);
          // Determine if it's likely EU based (simplistic approach)
          const isEU =
            firstMxDomain.endsWith(".eu") ||
            firstMxDomain.endsWith(".de") ||
            firstMxDomain.endsWith(".be") ||
            firstMxDomain.endsWith(".fr") ||
            firstMxDomain.endsWith(".nl") ||
            firstMxDomain.endsWith(".es");
          return { provider: `${provider} Mail`, isEU: isEU || null };
        }
      }
      return { provider: "Unknown email provider", isEU: null };
    }
  } catch (error) {
    console.error("Error detecting email provider:", error);
    return { provider: "Error detecting email provider", isEU: null };
  }
}

// Domain registrar detection from WHOIS data
async function detectDomainRegistrar(domain: string) {
  try {
    // Query WHOIS data for the domain
    const whoisData = (await whoisDomain(domain)) as Record<
      string,
      Record<string, string | string[]>
    >;

    // WHOIS data structure is an object where keys are WHOIS servers
    // We'll look for registrar information in any of the servers
    const registrars = new Set<string>();
    let registrar = null;
    let isEU = null;

    // Go through all WHOIS servers' responses
    for (const server in whoisData) {
      const data = whoisData[server];

      // Check for Registrar field with different possible formats
      if (
        data["Registrar"] ||
        data["Registrar:"] ||
        data["registrar:"] ||
        data["Registrar Name"]
      ) {
        registrar =
          data["Registrar"] ||
          data["Registrar:"] ||
          data["registrar:"] ||
          data["Registrar Name"];
        if (Array.isArray(registrar)) {
          registrar = registrar[0]; // Take the first one if it's an array
        }
        registrars.add(registrar);
      }
    }

    // If we found more than one registrar name, prioritize the most specific one
    const finalRegistrar = Array.from(registrars)[0] || "Unknown registrar";

    // Determine if registrar is EU-based
    const euRegistrars = [
      "gandi",
      "ovh",
      "infomaniak",
      "inwx",
      "one.com",
      "ionos",
      "pcextreme",
      "transip",
      "openprovider",
      "netim",
      "eurodns",
      "nomeo",
      "hostinger",
      "amen",
      "rrpproxy",
      "loopia",
      "ascio",
    ];

    // Check if any of the EU registrars are in the registrar name
    isEU = euRegistrars.some((euReg) =>
      finalRegistrar.toLowerCase().includes(euReg.toLowerCase())
    );

    // If registrar contains .eu, .de, .fr, etc. domains, assume it's EU-based
    if (!isEU) {
      isEU =
        /\.(eu|de|fr|nl|be|es|it|at|fi|se|dk|pl|cz|pt|gr|hu)(?:[^a-z]|$)/i.test(
          finalRegistrar
        );
    }

    return { provider: finalRegistrar, isEU };
  } catch (error) {
    console.error("Error detecting domain registrar:", error);
    return { provider: "Error detecting domain registrar", isEU: null };
  }
}

// Helper to clean provider names
function cleanProviderName(name: string): string {
  return name.replace(/,\s*$/, "").trim();
}

// Hosting provider detection from DNS records and IP WHOIS
async function detectHostingProvider(domain: string) {
  try {
    // Get all DNS records for the domain
    const dnsRecords = await getAllDnsRecords(domain);

    // Filter for A and CNAME records
    const aRecords = dnsRecords.filter((record) => record.type === "A");
    const cnameRecords = dnsRecords.filter((record) => record.type === "CNAME");

    // If we have A records, check their IPs
    if (aRecords.length > 0) {
      // Take first IP address to determine hosting
      const ip = aRecords[0].data;

      // Perform IP WHOIS lookup
      const ipWhois = (await whoisIp(ip)) as {
        organisation?: {
          ["org-name"]?: string;
          OrgName?: string;
        };
        Organization?: string | string[];
        Organisation?: string | string[];
        asn?: number;
        ASName?: string | string[];
        Country?: string | string[];
        country?: string | string[];
        NetName?: string | string[];
        netname?: string | string[];
        City?: string | string[];
        city?: string | string[];
        Region?: string | string[];
        region?: string | string[];
        ZipCode?: string | string[];
        zipcode?: string | string[];
      };

      // Try to determine the hosting provider from organization or ASN info
      let provider: string | null = null;

      if (ipWhois.organisation?.["org-name"]) {
        provider = cleanProviderName(ipWhois.organisation["org-name"]);
      } else if (ipWhois.organisation?.["OrgName"]) {
        provider = cleanProviderName(ipWhois.organisation["OrgName"]);
      } else if (ipWhois.Organisation) {
        provider = Array.isArray(ipWhois.Organisation)
          ? cleanProviderName(ipWhois.Organisation[0])
          : cleanProviderName(ipWhois.Organisation);
      } else if (ipWhois.asn) {
        const asnName = ipWhois.ASName
          ? Array.isArray(ipWhois.ASName)
            ? cleanProviderName(ipWhois.ASName[0])
            : cleanProviderName(ipWhois.ASName)
          : "Unknown";

        provider = `AS${ipWhois.asn} (${asnName})`;
      }

      // Determine EU status with three options: true, false, or null (unsure)
      let euStatus: boolean | null = null;

      // EU hosting providers
      const euHosts = [
        "hetzner",
        "ovh",
        "scaleway",
        "infomaniak",
        "ionos",
        "gandi",
        "netcup",
        "strato",
        "skysilk",
        "df.eu",
        "contabo",
        "netcup",
        "timeweb",
        "hosteurope",
      ];

      // Non-EU hosting providers
      const nonEuHosts = [
        "amazon",
        "aws",
        "digitalocean",
        "linode",
        "squarespace",
        "vultr",
        "heroku",
        "render",
        "vercel",
        "netlify",
        "cloudflare",
        "azure",
        "microsoft",
        "google",
        "gcp",
      ];

      // Check for EU patterns in organization name, ASN, or netname
      const orgData = [ipWhois.Organization, ipWhois.ASName, ipWhois.NetName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (euHosts.some((host) => orgData.includes(host.toLowerCase()))) {
        euStatus = true;
      } else if (
        nonEuHosts.some((host) => orgData.includes(host.toLowerCase()))
      ) {
        euStatus = false;
      } else if (ipWhois.Country || ipWhois.country) {
        // Check country code if available
        const euCountries = [
          "AT",
          "BE",
          "BG",
          "HR",
          "CY",
          "CZ",
          "DK",
          "EE",
          "FI",
          "FR",
          "DE",
          "GR",
          "HU",
          "IE",
          "IT",
          "LV",
          "LT",
          "LU",
          "MT",
          "NL",
          "PL",
          "PT",
          "RO",
          "SK",
          "SI",
          "ES",
          "SE",
        ];

        const country = ipWhois.Country || ipWhois.country;

        const countryCode = Array.isArray(country) ? country[0] : country;

        euStatus = euCountries.includes(countryCode || "");
      }

      return {
        provider: cleanProviderName(provider || "Unknown hosting provider"),
        isEU: euStatus,
      };
    }
    // If no A records but we have CNAME records, use those
    else if (cnameRecords.length > 0) {
      const cnameValue = cnameRecords[0].data;
      const cname =
        typeof cnameValue === "string" ? cnameValue.toLowerCase() : "";

      // Check for known cloud hosting in CNAME
      if (cname.includes("cloudfront.net")) {
        return { provider: "Amazon CloudFront", isEU: false };
      } else if (cname.includes("amazonaws.com")) {
        return { provider: "Amazon AWS", isEU: false };
      } else if (
        cname.includes("azure") ||
        cname.includes("azurewebsites.net")
      ) {
        return { provider: "Microsoft Azure", isEU: false };
      } else if (cname.includes("vercel.app")) {
        return { provider: "Vercel", isEU: false };
      } else if (cname.includes("netlify.app")) {
        return { provider: "Netlify", isEU: false };
      } else if (cname.includes("cloudflare")) {
        return { provider: "Cloudflare", isEU: false };
      } else if (cname.includes("heroku")) {
        return { provider: "Heroku", isEU: false };
      } else if (cname.includes("squarespace")) {
        return { provider: "Squarespace", isEU: false };
      } else if (cname.includes("ovh")) {
        return { provider: "OVH", isEU: true };
      } else if (cname.includes("hetzner")) {
        return { provider: "Hetzner", isEU: true };
      }

      // If we can't match against known providers, return the CNAME domain
      return {
        provider: cleanProviderName(`CNAME: ${cname}`),
        isEU: null, // Unsure about EU status
      };
    }

    return { provider: "Unknown hosting provider", isEU: null };
  } catch (error) {
    console.error("Error detecting hosting provider:", error);
    return { provider: "Error detecting hosting provider", isEU: null };
  }
}

// Third-party service detection by analyzing website content
async function detectThirdPartyServices(domain: string) {
  try {
    // Ensure the domain has a protocol
    const url = domain.startsWith("http") ? domain : `https://${domain}`;

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ServiceDetector/1.0)",
      },
    });

    if (!response.ok) {
      return {
        services: [{ name: "Error fetching website content", isEU: null }],
        isEU: null,
      };
    }

    const html = await response.text();

    // Define patterns for common third-party services
    const servicePatterns = [
      // Non-EU services
      {
        pattern: "google-analytics.com|gtag",
        name: "Google Analytics",
        isEU: false,
      },
      {
        pattern: "googletagmanager.com|gtm.js|GTM-",
        name: "Google Tag Manager",
        isEU: false,
      },
      {
        pattern: "facebook.net|fbevents.js|fbq\\(",
        name: "Facebook Pixel",
        isEU: false,
      },
      {
        pattern: "ads.linkedin.com|linkedin.com/insight",
        name: "LinkedIn Insight",
        isEU: false,
      },
      { pattern: "connect.facebook.net", name: "Facebook SDK", isEU: false },
      { pattern: "static.hotjar.com|hotjar.com", name: "Hotjar", isEU: false },
      {
        pattern: "js.hs-scripts.com|hs-analytics|hubspot",
        name: "HubSpot",
        isEU: false,
      },
      { pattern: "script.crazyegg.com", name: "Crazy Egg", isEU: false },
      {
        pattern: "googleadservices.com|google_conversion",
        name: "Google Ads",
        isEU: false,
      },
      { pattern: "snap.licdn.com", name: "LinkedIn Ads", isEU: false },
      {
        pattern: "sc-static.net|snapchat|snap pixel",
        name: "Snapchat Pixel",
        isEU: false,
      },
      {
        pattern: "analytics.tiktok.com|tiktok pixel",
        name: "TikTok Pixel",
        isEU: false,
      },
      { pattern: "cdn.amplitude.com", name: "Amplitude", isEU: false },
      { pattern: "js.intercomcdn.com", name: "Intercom", isEU: false },
      { pattern: "cdn.heapanalytics.com", name: "Heap Analytics", isEU: false },
      { pattern: "static.klaviyo.com", name: "Klaviyo", isEU: false },
      { pattern: "cdn.mouseflow.com", name: "Mouseflow", isEU: false },
      { pattern: "cdn.adroll.com", name: "AdRoll", isEU: false },

      // EU-based services
      { pattern: "plausible.io", name: "Plausible Analytics", isEU: true },
      {
        pattern: "simpleanalytics.io|simpleanalytics.com",
        name: "Simple Analytics",
        isEU: true,
      },
      {
        pattern: "matomo.cloud|matomo.js|matomo.php",
        name: "Matomo",
        isEU: true,
      },
      { pattern: "pirsch.io", name: "Pirsch Analytics", isEU: true },
      { pattern: "counter.dev", name: "Counter", isEU: true },
      { pattern: "getrewardful.com", name: "Rewardful", isEU: true },
      { pattern: "cdn.statically.io", name: "Statically", isEU: true },
      { pattern: "cookiebot.com", name: "Cookiebot", isEU: true },
      { pattern: "usercentrics.eu", name: "Usercentrics", isEU: true },
    ];

    // Check for patterns in HTML content
    // Extract all script tags content to avoid false positives
    const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    const scriptContent = scriptTags.join(" ");

    // Also extract all link tags for stylesheets and other resources
    const linkTags = html.match(/<link[^>]*>/gi) || [];
    const linkContent = linkTags.join(" ");

    // Combine script content and link tags for analysis
    const contentToAnalyze = scriptContent + " " + linkContent;

    console.log("contentToAnalyze", contentToAnalyze);

    // Check for patterns in script and link content
    const detectedServices = servicePatterns
      .filter((service) =>
        new RegExp(service.pattern, "i").test(contentToAnalyze)
      )
      .map((service) => ({ name: service.name, isEU: service.isEU }));

    // If no services detected, check for tracking pixel img tags
    if (detectedServices.length === 0) {
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const imgTagContent = imgTags.join(" ");

      // Check for tracking pixels in img tags
      servicePatterns.forEach((service) => {
        if (new RegExp(service.pattern, "i").test(imgTagContent)) {
          detectedServices.push({ name: service.name, isEU: service.isEU });
        }
      });
    }

    // If still empty, return a default message
    if (detectedServices.length === 0) {
      return {
        services: [],
        isEU: null,
      };
    }

    // Also check meta tags for common analytics IDs and verification tags
    const metaTags = html.match(/<meta[^>]*>/gi) || [];
    const metaContent = metaTags.join(" ");

    // Add specific check for Google Analytics IDs in the entire HTML
    // This is a more restrictive pattern that looks for GA ID formats
    if (
      new RegExp("UA-\\d+-\\d+", "i").test(html) ||
      new RegExp("G-[A-Z0-9]{10}", "i").test(html) ||
      new RegExp("gtag\\(\\s*['\"]config['\"]\\s*,\\s*['\"][G-UA]", "i").test(
        html
      )
    ) {
      // Check if Google Analytics is already in the list
      if (!detectedServices.some((s) => s.name === "Google Analytics")) {
        console.log("Google Analytics detected");
        detectedServices.push({ name: "Google Analytics", isEU: false });
      }
    }

    // Check meta tags for verification and other service indicators
    if (metaContent.includes("google-site-verification")) {
      // Check if Google Services is already in the list
      if (!detectedServices.some((s) => s.name === "Google Services")) {
        detectedServices.push({ name: "Google Services", isEU: false });
      }
    }

    // Determine overall EU status - if ANY non-EU service is detected, the result is non-EU
    const isEU = !detectedServices.some((service) => service.isEU === false);

    return {
      services: detectedServices,
      isEU: detectedServices.length > 0 ? isEU : null,
    };
  } catch (error) {
    console.error("Error detecting third-party services:", error);
    return {
      services: [{ name: "Error detecting third-party services", isEU: null }],
      isEU: null,
    };
  }
}

// Simulated analysis service
async function analyzeDomain(): Promise<AnalysisStep[]> {
  const analysisSteps: AnalysisStep[] = [
    {
      type: "mx_records",
      title: "Email Provider (MX Records)",
      status: "pending",
      details: null,
      isEU: null,
    },
    {
      type: "domain_registrar",
      title: "Domain Registrar (WHOIS)",
      status: "pending",
      details: null,
      isEU: null,
    },
    {
      type: "hosting",
      title: "Hosting Provider (A/CNAME Records)",
      status: "pending",
      details: null,
      isEU: null,
    },
    {
      type: "services",
      title: "Third-party Services",
      status: "pending",
      details: null,
      isEU: null,
    },
    {
      type: "cdn",
      title: "CDN Usage",
      status: "pending",
      details: null,
      isEU: null,
    },
  ];

  return analysisSteps;
}

// CDN detection from DNS records and HTTP headers
async function detectCdn(domain: string) {
  try {
    // 1. Check DNS records first
    const dnsRecords = await getAllDnsRecords(domain);

    // Check CNAME records for CDN patterns
    const cnameRecords = dnsRecords.filter((record) => record.type === "CNAME");
    for (const record of cnameRecords) {
      const cname = record.data.toLowerCase();

      // Common CDN CNAME patterns
      if (cname.includes("cloudfront.net")) {
        return { provider: "Amazon CloudFront", isEU: false };
      } else if (
        cname.includes("cloudflare.com") ||
        cname.includes("cdn.cloudflare.net")
      ) {
        return { provider: "Cloudflare", isEU: false };
      } else if (cname.includes("akamai") || cname.includes("akamaiedge.net")) {
        return { provider: "Akamai", isEU: false };
      } else if (cname.includes("fastly.net")) {
        return { provider: "Fastly", isEU: false };
      } else if (cname.includes("edgecast") || cname.includes("edgesuite")) {
        return { provider: "Edgecast/Verizon", isEU: false };
      } else if (cname.includes("bunnycdn.com")) {
        return { provider: "BunnyCDN", isEU: true };
      } else if (cname.includes("keycdn.com")) {
        return { provider: "KeyCDN", isEU: true };
      } else if (cname.includes("workers.dev")) {
        return { provider: "Cloudflare Workers", isEU: false };
      }
    }

    // 2. If no CDN found in DNS, check HTTP headers
    try {
      const url = domain.startsWith("http") ? domain : `https://${domain}`;
      const response = await fetch(url, {
        method: "HEAD", // Only get headers, not the full content
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CDNDetector/1.0)",
        },
      });

      const headers = response.headers;

      // Check for CDN-specific headers
      if (headers.get("cf-ray") || headers.get("cf-cache-status")) {
        return { provider: "Cloudflare", isEU: false };
      } else if (headers.get("x-amz-cf-id")) {
        return { provider: "Amazon CloudFront", isEU: false };
      } else if (
        headers.get("x-akamai-transformed") ||
        headers.get("x-akamai-request-id")
      ) {
        return { provider: "Akamai", isEU: false };
      } else if (headers.get("x-served-by")?.includes("fastly")) {
        return { provider: "Fastly", isEU: false };
      } else if (headers.get("server")?.includes("cloudflare")) {
        return { provider: "Cloudflare", isEU: false };
      } else if (
        headers.get("x-cdn")?.includes("bunny") ||
        headers.get("server")?.includes("bunnycdn")
      ) {
        return { provider: "BunnyCDN", isEU: true };
      }
    } catch (error) {
      // If fetch fails, continue with other methods
      console.error("Failed to fetch headers for CDN detection:", error);
    }

    // 3. Check A records if no CDN found yet
    const aRecords = dnsRecords.filter((record) => record.type === "A");
    if (aRecords.length > 0) {
      // Get the IP
      const ip = aRecords[0].data;

      try {
        // Check if IP belongs to known CDN ranges
        const ipWhois = await whoisIp(ip);

        // Extract organization info for CDN detection
        let orgName = "";

        if (typeof ipWhois === "object" && ipWhois !== null) {
          if (ipWhois.Organisation) {
            orgName = String(
              Array.isArray(ipWhois.Organisation)
                ? ipWhois.Organisation[0]
                : ipWhois.Organisation
            ).toLowerCase();
          } else if (ipWhois.Organization) {
            orgName = String(
              Array.isArray(ipWhois.Organization)
                ? ipWhois.Organization[0]
                : ipWhois.Organization
            ).toLowerCase();
          } else if (
            ipWhois.organisation &&
            typeof ipWhois.organisation === "object"
          ) {
            // Safe access to potential organization name properties
            const orgData = ipWhois.organisation as Record<string, unknown>;
            if ("org-name" in orgData) {
              orgName = String(orgData["org-name"]).toLowerCase();
            } else if ("OrgName" in orgData) {
              orgName = String(orgData["OrgName"]).toLowerCase();
            }
          }
        }

        if (orgName.includes("cloudflare")) {
          return { provider: "Cloudflare", isEU: false };
        } else if (orgName.includes("amazon") || orgName.includes("aws")) {
          return { provider: "Amazon CloudFront", isEU: false };
        } else if (orgName.includes("akamai")) {
          return { provider: "Akamai", isEU: false };
        } else if (orgName.includes("fastly")) {
          return { provider: "Fastly", isEU: false };
        } else if (orgName.includes("bunny")) {
          return { provider: "BunnyCDN", isEU: true };
        }
      } catch (error) {
        console.error("Error in IP WHOIS lookup for CDN detection:", error);
      }
    }

    // No CDN detected
    return { provider: "No CDN detected", isEU: null };
  } catch (error) {
    console.error("Error detecting CDN:", error);
    return { provider: "Error detecting CDN", isEU: null };
  }
}

// Function to simulate checking domain with streaming updates
async function* checkDomain(domain: string): AsyncGenerator<AnalysisStep[]> {
  const initialAnalysis = await analyzeDomain();
  yield initialAnalysis;

  // Real check for MX records
  initialAnalysis[0].status = "processing";
  yield [...initialAnalysis];
  const mxResults = await detectEmailProvider(domain);
  initialAnalysis[0].status = "complete";
  initialAnalysis[0].details = mxResults.provider;
  initialAnalysis[0].isEU = mxResults.isEU;
  yield [...initialAnalysis];

  // Real check for domain registrar using WHOIS
  initialAnalysis[1].status = "processing";
  yield [...initialAnalysis];
  const registrarResults = await detectDomainRegistrar(domain);
  initialAnalysis[1].status = "complete";
  initialAnalysis[1].details = registrarResults.provider;
  initialAnalysis[1].isEU = registrarResults.isEU;
  yield [...initialAnalysis];

  // Real check for hosting provider
  initialAnalysis[2].status = "processing";
  yield [...initialAnalysis];
  const hostingResults = await detectHostingProvider(domain);
  initialAnalysis[2].status = "complete";
  initialAnalysis[2].details = hostingResults.provider;
  initialAnalysis[2].isEU = hostingResults.isEU;
  yield [...initialAnalysis];

  // Real check for third-party services
  initialAnalysis[3].status = "processing";
  yield [...initialAnalysis];

  const servicesResults = await detectThirdPartyServices(domain);
  initialAnalysis[3].status = "complete";
  initialAnalysis[3].details = servicesResults.services;
  initialAnalysis[3].isEU = servicesResults.isEU;
  yield [...initialAnalysis];

  // Real check for CDN
  initialAnalysis[4].status = "processing";
  yield [...initialAnalysis];
  const cdnResults = await detectCdn(domain);
  initialAnalysis[4].status = "complete";
  initialAnalysis[4].details = cdnResults.provider;
  initialAnalysis[4].isEU = cdnResults.isEU;
  yield [...initialAnalysis];

  // Cache final results in Redis
  await setInRedis(`domain:${domain}`, initialAnalysis);

  return initialAnalysis;
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain");
  const force = request.nextUrl.searchParams.get("force") === "true";

  if (!domain) {
    return NextResponse.json(
      { error: "Domain parameter is required" },
      { status: 400 }
    );
  }

  // Check if we have cached results (and not forcing a new analysis)
  const cachedResults = !force ? await getFromRedis(`domain:${domain}`) : null;

  if (cachedResults) {
    // Parse the cached results from Redis
    const parsedResults =
      typeof cachedResults === "string"
        ? JSON.parse(cachedResults)
        : cachedResults;

    return NextResponse.json({
      results: parsedResults,
      cached: true,
      complete: true,
    });
  }

  // Set up streaming response
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const domainChecker = checkDomain(domain);

      let result;
      do {
        result = await domainChecker.next();

        if (!result.done) {
          const data =
            JSON.stringify({
              results: result.value,
              complete: false,
            }) + "\n";
          controller.enqueue(encoder.encode(data));
        } else {
          const data =
            JSON.stringify({
              results: result.value,
              complete: true,
            }) + "\n";
          controller.enqueue(encoder.encode(data));
        }
      } while (!result.done);

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
