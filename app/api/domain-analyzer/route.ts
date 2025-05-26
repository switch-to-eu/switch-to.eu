import { NextRequest, NextResponse } from "next/server";
import { getFromRedis, setInRedis } from "@/lib/redis";
import { AnalysisStep, Service } from "@/lib/types";
import { getAllDnsRecords } from "@layered/dns-records";
import { whoisDomain, whoisIp } from "whoiser";
import {
  isEUCountry,
  getDomainEUStatus,
  isEUDomain,
  isEUFriendlyDomain,
} from "@/lib/countries";

// Email provider detection from real MX records
async function detectEmailProvider(domain: string): Promise<{
  provider: string;
  isEU: boolean | null;
  euFriendly: boolean | null;
}> {
  try {
    const dnsRecords = await getAllDnsRecords(domain);
    const mxRecords = dnsRecords.filter((record) => record.type === "MX");

    // If no MX records found, return unknown
    if (!mxRecords || mxRecords.length === 0) {
      return {
        provider: "",
        isEU: null,
        euFriendly: null,
      };
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
      return { provider: "Google Workspace", isEU: false, euFriendly: false };
    } else if (
      mxDomains.some(
        (mx) =>
          mx.includes("outlook") ||
          mx.includes("hotmail") ||
          mx.includes("microsoft")
      )
    ) {
      return { provider: "Microsoft 365", isEU: false, euFriendly: false };
    } else if (mxDomains.some((mx) => mx.includes("zoho"))) {
      return { provider: "Zoho Mail", isEU: false, euFriendly: false };
    } else if (mxDomains.some((mx) => mx.includes("infomaniak"))) {
      return { provider: "Infomaniak", isEU: false, euFriendly: true };
    } else if (mxDomains.some((mx) => mx.includes("mailbox.org"))) {
      return { provider: "Mailbox.org", isEU: true, euFriendly: false };
    } else if (
      mxDomains.some((mx) => mx.includes("proton") || mx.includes("protonmail"))
    ) {
      return { provider: "Proton Mail", isEU: false, euFriendly: true };
    } else if (mxDomains.some((mx) => mx.includes("ovh"))) {
      return { provider: "OVH", isEU: true, euFriendly: false };
    } else if (mxDomains.some((mx) => mx.includes("cloudflare"))) {
      return { provider: "Cloudflare", isEU: false, euFriendly: false };
    } else if (mxDomains.some((mx) => mx.includes("ionos"))) {
      return { provider: "IONOS", isEU: true, euFriendly: false };
    } else if (mxDomains.some((mx) => mx.includes("hetzner"))) {
      return { provider: "Hetzner", isEU: true, euFriendly: false };
    } else if (mxDomains.some((mx) => mx.includes("gandi"))) {
      return { provider: "Gandi", isEU: true, euFriendly: false };
    } else if (mxDomains.some((mx) => mx.includes("Nameweb"))) {
      return { provider: "Nameweb", isEU: true, euFriendly: false };
    } else {
      // Check for common hosting patterns or return the first MX domain
      const firstMxDomain = mxDomains[0];
      if (firstMxDomain) {
        const domainParts = firstMxDomain.split(".");
        if (domainParts.length >= 2) {
          const provider =
            domainParts[domainParts.length - 2].charAt(0).toUpperCase() +
            domainParts[domainParts.length - 2].slice(1);

          // Use the domain EU detection utility to determine EU status
          const domainStatus = getDomainEUStatus(firstMxDomain);

          return {
            provider: `${provider} Mail`,
            isEU: domainStatus.isEU,
            euFriendly: domainStatus.euFriendly,
          };
        }
      }
      return {
        provider: "Unknown email provider",
        isEU: null,
        euFriendly: null,
      };
    }
  } catch (error) {
    console.error("Error detecting email provider:", error);
    return {
      provider: "Error detecting email provider",
      isEU: null,
      euFriendly: null,
    };
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
    const registrars = new Set<{
      name: string;
      url?: string;
    }>();

    let registrar = null;
    let isEU = null;
    let euFriendly = null;

    // Go through all WHOIS servers' responses
    for (const server in whoisData) {
      const data = whoisData[server];

      let url = data["Registrar URL"] || data["Registrar URL:"];

      if (url && Array.isArray(url)) {
        url = url[0];
      }

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

        registrars.add({
          name: registrar,
          url: url,
        });
      }
    }

    //
    const finalRegistrar = Array.from(registrars)[0] || "Unknown registrar";

    console.log("finalRegistrar", finalRegistrar);

    // Determine if registrar is EU-based
    const euRegistrars = [
      "gandi",
      "ovh",
      "registrar.eu",
      "inwx",
      "one.com",
      "ionos",
      "pcextreme",
      "transip",
      "nameweb",
      "openprovider",
      "netim",
      "eurodns",
      "nomeo",
      "hostinger",
      "amen",
      "rrpproxy",
      "loopia",
      "ascio",
      "combell",
      "Mediahuis",
      "BELNET",
    ];

    const euFriendlyRegistrars = ["infomaniak"];

    // Check if any of the EU registrars are in the registrar name
    isEU = euRegistrars.some((euReg) =>
      finalRegistrar.name.toLowerCase().includes(euReg.toLowerCase())
    );

    euFriendly = euFriendlyRegistrars.some((euFriendlyReg) =>
      finalRegistrar.name.toLowerCase().includes(euFriendlyReg.toLowerCase())
    );

    if (!isEU && !euFriendly) {
      isEU = isEUDomain(finalRegistrar.url);
      euFriendly = isEUFriendlyDomain(finalRegistrar.url);
      console.log(isEU, euFriendly);
    }

    return { provider: finalRegistrar, isEU, euFriendly };
  } catch (error) {
    console.error("Error detecting domain registrar:", error);

    return {
      provider: {
        name: null,
      },
      isEU: null,
      euFriendly: null,
    };
  }
}

// Hosting provider detection from DNS records and IP WHOIS
async function detectHostingProvider(domain: string): Promise<{
  provider: string;
  isEU: boolean | null;
  euFriendly: boolean | null;
}> {
  try {
    const dnsRecords = await getAllDnsRecords(domain);
    const aRecords = dnsRecords.filter((r) => r.type === "A");
    const cnameRecords = dnsRecords.filter((r) => r.type === "CNAME");

    if (aRecords.length > 0) {
      const ip = aRecords[0].data;
      // ----- New IPinfo lookup -----
      const ipinfoRes = await fetch(
        `https://api.ipinfo.io/lite/${ip}?token=${process.env.IP_INFO_TOKEN}`
      );
      const ipInfo = await ipinfoRes.json();

      // Parse provider from "org" (e.g. "AS15169 Google LLC")
      const orgString = ipInfo.as_name || "";

      const provider = orgString || "Unknown hosting provider";

      // Country code from IPinfo
      const country_code = ipInfo.country_code;

      // Determine EU status: prefer IP country, else domain extension
      let euStatus: boolean | null;
      let euFriendly: boolean | null;
      if (country_code) {
        euStatus = isEUCountry(country_code);
        euFriendly = false;
      } else {
        const domainStatus = getDomainEUStatus(domain);
        euStatus = domainStatus.isEU;
        euFriendly = domainStatus.euFriendly;
      }

      return {
        provider: provider.trim(),
        isEU: euStatus,
        euFriendly: euFriendly,
      };
    }

    // Fallback to CNAME-based detection
    if (cnameRecords.length > 0) {
      const cname = String(cnameRecords[0].data).toLowerCase();
      // … (your existing CNAME checks here) …

      const domainStatus = getDomainEUStatus(cname);

      return {
        provider: `CNAME: ${cname}`,
        isEU: domainStatus.isEU,
        euFriendly: domainStatus.euFriendly,
      };
    }

    // Final fallback to extension only
    const domainStatus = getDomainEUStatus(domain);

    return {
      provider: "Unknown hosting provider",
      isEU: domainStatus.isEU,
      euFriendly: domainStatus.euFriendly,
    };
  } catch (error) {
    console.error("Error detecting hosting provider:", error);
    return {
      provider: "Error detecting hosting provider",
      isEU: null,
      euFriendly: null,
    };
  }
}

// Third-party service detection by analyzing website content
async function detectThirdPartyServices(domain: string): Promise<{
  services: Service[];
  isEU: boolean | null;
  euFriendly: boolean | null;
}> {
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
        services: [],
        isEU: null,
        euFriendly: null,
      };
    }

    const html = await response.text();

    const servicePatterns: Service[] = [
      {
        pattern: "google-analytics.com|gtag",
        name: "Google Analytics",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "googletagmanager.com|gtm.js|GTM-",
        name: "Google Tag Manager",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "facebook.net|fbevents.js|fbq\\(",
        name: "Facebook Pixel",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "ads.linkedin.com|linkedin.com/insight",
        name: "LinkedIn Insight",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "connect.facebook.net",
        name: "Facebook SDK",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "static.hotjar.com|hotjar.com",
        name: "Hotjar",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "js.hs-scripts.com|hs-analytics|hubspot",
        name: "HubSpot",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "script.crazyegg.com",
        name: "Crazy Egg",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "googleadservices.com|google_conversion",
        name: "Google Ads",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "snap.licdn.com",
        name: "LinkedIn Ads",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "sc-static.net|snapchat|snap pixel",
        name: "Snapchat Pixel",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "analytics.tiktok.com|tiktok pixel",
        name: "TikTok Pixel",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "cdn.amplitude.com",
        name: "Amplitude",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "js.intercomcdn.com",
        name: "Intercom",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "cdn.heapanalytics.com",
        name: "Heap Analytics",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "static.klaviyo.com",
        name: "Klaviyo",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "cdn.mouseflow.com",
        name: "Mouseflow",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "cdn.adroll.com",
        name: "AdRoll",
        isEU: false,
        euFriendly: false,
      },
      // EU-based services
      {
        pattern: "plausible.io",
        name: "Plausible Analytics",
        isEU: true,
        euFriendly: false,
      },
      {
        pattern: "simpleanalytics.io|simpleanalytics.com",
        name: "Simple Analytics",
        isEU: true,
        euFriendly: false,
      },
      {
        pattern: "matomo.cloud|matomo.js|matomo.php",
        name: "Matomo",
        isEU: false,
        euFriendly: true,
      },
      {
        pattern: "pirsch.io",
        name: "Pirsch Analytics",
        isEU: true,
        euFriendly: false,
      },
      {
        pattern: "counter.dev",
        name: "Counter",
        isEU: true,
        euFriendly: false,
      },
      {
        pattern: "getrewardful.com",
        name: "Rewardful",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "cdn.statically.io",
        name: "Statically",
        isEU: false,
        euFriendly: false,
      },
      {
        pattern: "cookiebot.com",
        name: "Cookiebot",
        isEU: true,
        euFriendly: false,
      },
      {
        pattern: "usercentrics.eu",
        name: "Usercentrics",
        isEU: true,
        euFriendly: false,
      },
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

    // Check for patterns in script and link content
    const detectedServices = servicePatterns.filter((service) =>
      new RegExp(service.pattern || "", "i").test(contentToAnalyze)
    );

    // If no services detected, check for tracking pixel img tags
    if (detectedServices.length === 0) {
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const imgTagContent = imgTags.join(" ");

      // Check for tracking pixels in img tags
      servicePatterns.forEach((service) => {
        if (new RegExp(service.pattern || "", "i").test(imgTagContent)) {
          detectedServices.push({
            name: service.name,
            isEU: service.isEU,
            euFriendly: service.euFriendly,
          });
        }
      });
    }

    // If still empty, return a default message
    if (detectedServices.length === 0) {
      return {
        services: [],
        isEU: null,
        euFriendly: null,
      };
    }

    // Also check meta tags for common analytics IDs and verification tags
    const metaTags = html.match(/<meta[^>]*>/gi) || [];
    const metaContent = metaTags.join(" ");

    // Add specific check for Google Analytics IDs in the entire HTML
    // This is a more restrictive pattern that looks for GA ID formats
    if (
      new RegExp("UA-\\d+-\\d+", "i").test(html) ||
      new RegExp("gtag\\(\\s*['\"]config['\"]\\s*,\\s*['\"][G-UA]", "i").test(
        html
      )
    ) {
      // Check if Google Analytics is already in the list
      if (!detectedServices.some((s) => s.name === "Google Analytics")) {
        detectedServices.push({
          name: "Google Analytics",
          isEU: false,
          euFriendly: false,
        });
      }
    }

    // Check meta tags for verification and other service indicators
    if (metaContent.includes("google-site-verification")) {
      // Check if Google Services is already in the list
      if (!detectedServices.some((s) => s.name === "Google Services")) {
        detectedServices.push({
          name: "Google Services",
          isEU: false,
          euFriendly: false,
        });
      }
    }

    // Determine overall EU status - if ANY non-EU service is detected, the result is non-EU
    const isEU = !detectedServices.some((service) => service.isEU === false);
    const euFriendly = detectedServices.some((service) => service.euFriendly);

    return {
      services: detectedServices,
      isEU: detectedServices.length > 0 ? isEU : null,
      euFriendly: detectedServices.length > 0 ? euFriendly : null,
    };
  } catch (error) {
    console.error("Error detecting third-party services:", error);
    return {
      services: [],
      isEU: null,
      euFriendly: null,
    };
  }
}

// Simulated analysis service
async function analyzeDomain(): Promise<AnalysisStep[]> {
  const analysisSteps: AnalysisStep[] = [
    {
      type: "mx_records",
      status: "pending",
      details: null,
      isEU: null,
      euFriendly: null,
    },
    {
      type: "domain_registrar",
      status: "pending",
      details: null,
      isEU: null,
      euFriendly: null,
    },
    {
      type: "hosting",
      status: "pending",
      details: null,
      isEU: null,
      euFriendly: null,
    },
    {
      type: "services",
      status: "pending",
      details: null,
      isEU: null,
      euFriendly: null,
    },
    {
      type: "cdn",
      status: "pending",
      details: null,
      isEU: null,
      euFriendly: null,
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
        return {
          provider: "Amazon CloudFront",
          isEU: false,
          euFriendly: false,
        };
      } else if (
        cname.includes("cloudflare.com") ||
        cname.includes("cdn.cloudflare.net")
      ) {
        return { provider: "Cloudflare", isEU: false, euFriendly: false };
      } else if (cname.includes("akamai") || cname.includes("akamaiedge.net")) {
        return { provider: "Akamai", isEU: false, euFriendly: false };
      } else if (cname.includes("fastly.net")) {
        return { provider: "Fastly", isEU: false, euFriendly: false };
      } else if (cname.includes("edgecast") || cname.includes("edgesuite")) {
        return { provider: "Edgecast/Verizon", isEU: false, euFriendly: false };
      } else if (cname.includes("bunnycdn.com")) {
        return { provider: "BunnyCDN", isEU: true, euFriendly: false };
      } else if (cname.includes("keycdn.com")) {
        return { provider: "KeyCDN", isEU: true, euFriendly: false };
      } else if (cname.includes("workers.dev")) {
        return {
          provider: "Cloudflare Workers",
          isEU: false,
          euFriendly: false,
        };
      }
    }

    // 2. If no CDN found in DNS, check HTTP headers
    try {
      const url = domain.startsWith("http") ? domain : `https://${domain}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CDNDetector/1.0)",
        },
      });

      const headers = response.headers;

      // Check for CDN-specific headers
      if (headers.get("cf-ray") || headers.get("cf-cache-status")) {
        return { provider: "Cloudflare", isEU: false, euFriendly: false };
      } else if (headers.get("x-amz-cf-id")) {
        return {
          provider: "Amazon CloudFront",
          isEU: false,
          euFriendly: false,
        };
      } else if (
        headers.get("x-akamai-transformed") ||
        headers.get("x-akamai-request-id")
      ) {
        return { provider: "Akamai", isEU: false, euFriendly: false };
      } else if (headers.get("x-served-by")?.includes("fastly")) {
        return { provider: "Fastly", isEU: false, euFriendly: false };
      } else if (headers.get("server")?.includes("cloudflare")) {
        return { provider: "Cloudflare", isEU: false, euFriendly: false };
      } else if (
        headers.get("x-cdn")?.includes("bunny") ||
        headers.get("server")?.includes("bunnycdn")
      ) {
        return { provider: "BunnyCDN", isEU: true, euFriendly: false };
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

        // Try to determine CDN by organization name
        if (orgName.includes("cloudflare")) {
          return { provider: "Cloudflare", isEU: false, euFriendly: false };
        } else if (orgName.includes("amazon") || orgName.includes("aws")) {
          return {
            provider: "Amazon CloudFront",
            isEU: false,
            euFriendly: false,
          };
        } else if (orgName.includes("akamai")) {
          return { provider: "Akamai", isEU: false, euFriendly: false };
        } else if (orgName.includes("fastly")) {
          return { provider: "Fastly", isEU: false, euFriendly: false };
        } else if (orgName.includes("bunny")) {
          return { provider: "BunnyCDN", isEU: true, euFriendly: false };
        }

        // Check country code from IP WHOIS if organization-based detection fails
        if (ipWhois.Country || ipWhois.country) {
          const country = ipWhois.Country || ipWhois.country;
          const countryCode = Array.isArray(country) ? country[0] : country;

          // If we have a country code but couldn't identify the CDN provider by name,
          // return a generic CDN provider with EU status based on the country
          if (countryCode && orgName) {
            const countryCodeStr =
              typeof countryCode === "string"
                ? countryCode
                : String(countryCode);
            return {
              provider: orgName.charAt(0).toUpperCase() + orgName.slice(1),
              isEU: isEUCountry(countryCodeStr),
              euFriendly: false,
            };
          }
        }
      } catch (error) {
        console.error("Error in IP WHOIS lookup for CDN detection:", error);
      }
    }

    return {
      provider: "",
      isEU: null,
      euFriendly: null,
    };
  } catch (error) {
    console.error("Error detecting CDN:", error);
    return { provider: "Error detecting CDN", isEU: null, euFriendly: null };
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
  initialAnalysis[0].euFriendly = mxResults.euFriendly;
  yield [...initialAnalysis];

  // Real check for domain registrar using WHOIS
  initialAnalysis[1].status = "processing";
  yield [...initialAnalysis];
  const registrarResults = await detectDomainRegistrar(domain);
  initialAnalysis[1].status = "complete";
  initialAnalysis[1].details = registrarResults.provider?.name;
  initialAnalysis[1].isEU = registrarResults.isEU;
  initialAnalysis[1].euFriendly = registrarResults.euFriendly;
  yield [...initialAnalysis];

  // Real check for hosting provider
  initialAnalysis[2].status = "processing";
  yield [...initialAnalysis];
  const hostingResults = await detectHostingProvider(domain);
  initialAnalysis[2].status = "complete";
  initialAnalysis[2].details = hostingResults.provider;
  initialAnalysis[2].isEU = hostingResults.isEU;
  initialAnalysis[2].euFriendly = hostingResults.euFriendly;
  yield [...initialAnalysis];

  // Real check for third-party services
  initialAnalysis[3].status = "processing";
  yield [...initialAnalysis];

  const servicesResults = await detectThirdPartyServices(domain);
  initialAnalysis[3].status = "complete";
  initialAnalysis[3].details = servicesResults.services;
  initialAnalysis[3].isEU = servicesResults.isEU;
  initialAnalysis[3].euFriendly = servicesResults.euFriendly;
  yield [...initialAnalysis];

  // Real check for CDN
  initialAnalysis[4].status = "processing";
  yield [...initialAnalysis];
  const cdnResults = await detectCdn(domain);
  initialAnalysis[4].status = "complete";
  initialAnalysis[4].details = cdnResults.provider;
  initialAnalysis[4].isEU = cdnResults.isEU;
  initialAnalysis[4].euFriendly = cdnResults.euFriendly;
  yield [...initialAnalysis];

  // Cache final results in Redis
  await setInRedis(`domain:${domain}`, initialAnalysis);

  return initialAnalysis;
}

// Function to check if a domain exists by attempting a DNS lookup
async function checkDomainExists(domain: string): Promise<boolean> {
  try {
    // Try to get DNS records as a simple existence check
    const dnsRecords = await getAllDnsRecords(domain);
    // If we get any records at all, the domain exists
    return dnsRecords.length > 0;
  } catch (error) {
    console.error("Error checking domain existence:", error);
    return false;
  }
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

  // Check if domain exists before proceeding
  const domainExists = await checkDomainExists(domain);

  if (!domainExists) {
    return NextResponse.json(
      {
        error: "Domain not found",
        domainExists: false,
        complete: true,
      },
      { status: 404 }
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
      domainExists: true,
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
              domainExists: true,
            }) + "\n";
          controller.enqueue(encoder.encode(data));
        } else {
          const data =
            JSON.stringify({
              results: result.value,
              complete: true,
              domainExists: true,
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
