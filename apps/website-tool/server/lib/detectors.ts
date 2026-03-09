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
export async function detectEmailProvider(domain: string): Promise<{
  provider: string;
  isEU: boolean | null;
  euFriendly: boolean | null;
}> {
  try {
    const dnsRecords = await getAllDnsRecords(domain);
    const mxRecords = dnsRecords.filter((record) => record.type === "MX");

    if (!mxRecords || mxRecords.length === 0) {
      return {
        provider: "",
        isEU: null,
        euFriendly: null,
      };
    }

    const sortedMX = mxRecords.sort((a, b) => {
      const priorityA = parseInt(a.data.split(" ")[0] || "0", 10);
      const priorityB = parseInt(b.data.split(" ")[0] || "0", 10);
      return priorityA - priorityB;
    });

    const mxDomains = sortedMX.map((record) => {
      const parts = record.data.split(" ");
      if (parts.length > 1 && parts[1]) {
        return parts[1].toLowerCase();
      }
      return record.data.toLowerCase();
    });

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
    } else if (mxDomains.some((mx) => mx.includes("nameweb"))) {
      return { provider: "Nameweb", isEU: true, euFriendly: false };
    } else {
      const firstMxDomain = mxDomains[0];
      if (firstMxDomain) {
        const domainParts = firstMxDomain.split(".");
        if (domainParts.length >= 2) {
          const domainPart = domainParts[domainParts.length - 2];
          if (domainPart) {
            const provider = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
            const domainStatus = getDomainEUStatus(firstMxDomain);

            return {
              provider: `${provider} Mail`,
              isEU: domainStatus.isEU,
              euFriendly: domainStatus.euFriendly,
            };
          }
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
export async function detectDomainRegistrar(domain: string) {
  try {
    const whoisData = (await whoisDomain(domain)) as Record<
      string,
      Record<string, string | string[]>
    >;

    const registrars = new Set<{
      name: string;
      url?: string;
    }>();

    let registrar = null;
    let isEU = null;
    let euFriendly = null;

    for (const server in whoisData) {
      const data = whoisData[server];

      if (!data) continue;

      let url: string | undefined = undefined;
      const rawUrl = data["Registrar URL"] || data["Registrar URL:"];

      if (rawUrl) {
        url = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl;
      }

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
          registrar = registrar[0];
        }

        if (typeof registrar === 'string') {
          registrars.add({
            name: registrar,
            url: url,
          });
        }
      }
    }

    const finalRegistrar = Array.from(registrars)[0] || {
      name: "Unknown registrar",
      url: undefined,
    };

    console.log("finalRegistrar", finalRegistrar);

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

    isEU = euRegistrars.some((euReg) =>
      finalRegistrar.name.toLowerCase().includes(euReg.toLowerCase())
    );

    euFriendly = euFriendlyRegistrars.some((euFriendlyReg) =>
      finalRegistrar.name.toLowerCase().includes(euFriendlyReg.toLowerCase())
    );

    if (!isEU && !euFriendly && finalRegistrar.url) {
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
export async function detectHostingProvider(domain: string): Promise<{
  provider: string;
  isEU: boolean | null;
  euFriendly: boolean | null;
}> {
  try {
    const dnsRecords = await getAllDnsRecords(domain);
    const aRecords = dnsRecords.filter((r) => r.type === "A");
    const cnameRecords = dnsRecords.filter((r) => r.type === "CNAME");

    if (aRecords.length > 0 && aRecords[0]) {
      const ip = aRecords[0].data;
      const ipinfoRes = await fetch(
        `https://api.ipinfo.io/lite/${ip}?token=${process.env.IP_INFO_TOKEN}`
      );
      const ipInfo = await ipinfoRes.json() as { as_name?: string; country_code?: string };

      const orgString: string = ipInfo.as_name ?? "";
      const provider: string = orgString || "Unknown hosting provider";
      const country_code: string | undefined = ipInfo.country_code;

      let euStatus: boolean | null;
      let euFriendly: boolean | null;
      if (country_code && typeof country_code === 'string') {
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

    if (cnameRecords.length > 0 && cnameRecords[0]) {
      const cname = String(cnameRecords[0].data).toLowerCase();

      const domainStatus = getDomainEUStatus(cname);

      return {
        provider: `CNAME: ${cname}`,
        isEU: domainStatus.isEU,
        euFriendly: domainStatus.euFriendly,
      };
    }

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
export async function detectThirdPartyServices(domain: string): Promise<{
  services: Service[];
  isEU: boolean | null;
  euFriendly: boolean | null;
}> {
  try {
    const url = domain.startsWith("http") ? domain : `https://${domain}`;

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

    const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    const scriptContent = scriptTags.join(" ");

    const linkTags = html.match(/<link[^>]*>/gi) || [];
    const linkContent = linkTags.join(" ");

    const contentToAnalyze = scriptContent + " " + linkContent;

    const detectedServices = servicePatterns.filter((service) =>
      new RegExp(service.pattern || "", "i").test(contentToAnalyze)
    );

    if (detectedServices.length === 0) {
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const imgTagContent = imgTags.join(" ");

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

    if (detectedServices.length === 0) {
      return {
        services: [],
        isEU: null,
        euFriendly: null,
      };
    }

    const metaTags = html.match(/<meta[^>]*>/gi) || [];
    const _metaContent = metaTags.join(" ");

    if (
      new RegExp("UA-\\d+-\\d+", "i").test(html) ||
      new RegExp("gtag\\(\\s*['\"]config['\"]\\s*,\\s*['\"][G-UA]", "i").test(
        html
      )
    ) {
      if (!detectedServices.some((s) => s.name === "Google Analytics")) {
        detectedServices.push({
          name: "Google Analytics",
          isEU: false,
          euFriendly: false,
        });
      }
    }

    if (_metaContent.includes("google-site-verification")) {
      if (!detectedServices.some((s) => s.name === "Google Services")) {
        detectedServices.push({
          name: "Google Services",
          isEU: false,
          euFriendly: false,
        });
      }
    }

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

// CDN detection from DNS records and HTTP headers
export async function detectCdn(domain: string) {
  try {
    const dnsRecords = await getAllDnsRecords(domain);

    const cnameRecords = dnsRecords.filter((record) => record.type === "CNAME");
    for (const record of cnameRecords) {
      const cname = record.data.toLowerCase();

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

    try {
      const url = domain.startsWith("http") ? domain : `https://${domain}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CDNDetector/1.0)",
        },
      });

      const headers = response.headers;

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
      console.error("Failed to fetch headers for CDN detection:", error);
    }

    const aRecords = dnsRecords.filter((record) => record.type === "A");
    if (aRecords.length > 0 && aRecords[0]) {
      const ip = aRecords[0].data;

      try {
        const ipWhois = await whoisIp(ip);

        let orgName = "";

        if (typeof ipWhois === "object" && ipWhois !== null) {
          if (ipWhois.Organisation) {
            const org = Array.isArray(ipWhois.Organisation)
              ? ipWhois.Organisation[0]
              : ipWhois.Organisation;
            orgName = org != null && typeof org === 'string' ? org.toLowerCase() : '';
          } else if (ipWhois.Organization) {
            const org = Array.isArray(ipWhois.Organization)
              ? ipWhois.Organization[0]
              : ipWhois.Organization;
            orgName = org != null && typeof org === 'string' ? org.toLowerCase() : '';
          } else if (
            ipWhois.organisation &&
            typeof ipWhois.organisation === "object"
          ) {
            const orgData = ipWhois.organisation as Record<string, unknown>;
            if ("org-name" in orgData) {
              orgName = String(orgData["org-name"]).toLowerCase();
            } else if ("OrgName" in orgData) {
              orgName = String(orgData["OrgName"]).toLowerCase();
            }
          }
        }

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

        if (ipWhois.Country || ipWhois.country) {
          const country = ipWhois.Country || ipWhois.country;
          const countryCode = Array.isArray(country) ? country[0] : country;

          if (countryCode && orgName && typeof countryCode === 'string') {
            return {
              provider: orgName.charAt(0).toUpperCase() + orgName.slice(1),
              isEU: isEUCountry(countryCode),
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

// Create initial analysis template with all steps pending
export function createAnalysisTemplate(): AnalysisStep[] {
  return [
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
}

// Check if a domain exists by attempting a DNS lookup
export async function checkDomainExists(domain: string): Promise<boolean> {
  try {
    const dnsRecords = await getAllDnsRecords(domain);
    return dnsRecords.length > 0;
  } catch (error) {
    console.error("Error checking domain existence:", error);
    return false;
  }
}
