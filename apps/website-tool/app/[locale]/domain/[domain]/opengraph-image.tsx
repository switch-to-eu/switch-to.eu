import { ImageResponse } from "next/og";
import { AnalysisStep } from "@/lib/types";
import { api } from "@/server/api/trpc-server";

export const alt = "Domain EU Compliance Analysis";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function formatDomain(domain: string) {
  return domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
}

function getServiceIcon(
  type: string,
  isEU: boolean | null,
  euFriendly: boolean | null
) {
  if (isEU === true || euFriendly === true) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "#22c55e",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    );
  } else if (isEU === false && euFriendly === false) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "#ef4444",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: "#94a3b8",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </div>
  );
}

function getServiceName(type: string) {
  switch (type) {
    case "mx_records":
      return "Email Service";
    case "domain_registrar":
      return "Domain Registrar";
    case "hosting":
      return "Hosting Provider";
    case "cdn":
      return "CDN Service";
    case "services":
      return "Other Services";
    default:
      return type;
  }
}

function getStatusText(isEU: boolean | null, euFriendly: boolean | null) {
  if (isEU === true) {
    return "EU Based";
  } else if (euFriendly === true) {
    return "EU Friendly";
  } else if (isEU === false && euFriendly === false) {
    return "Non-EU";
  }
  return "Unknown";
}

function getStatusColor(isEU: boolean | null, euFriendly: boolean | null) {
  if (isEU === true || euFriendly === true) {
    return "#15803d";
  } else if (isEU === false && euFriendly === false) {
    return "#b91c1c";
  }
  return "#64748b";
}

export default async function Image({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const formattedDomain = formatDomain(domain);

  const results = (await api.domain.getCached({ domain })) ?? [];

  const bricolageGrotesque = await fetch(
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&display=swap"
  ).then((res) => res.text());

  const hankenGroteskSemiBold = await fetch(
    "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600&display=swap"
  ).then((res) => res.text());

  const hankenGroteskBold = await fetch(
    "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@700&display=swap"
  ).then((res) => res.text());

  const bricolageUrl = bricolageGrotesque.match(/url\((.*?)\)/)?.[1];
  const hankenSemiBoldUrl = hankenGroteskSemiBold.match(/url\((.*?)\)/)?.[1];
  const hankenBoldUrl = hankenGroteskBold.match(/url\((.*?)\)/)?.[1];

  const [bricolageFont, hankenSemiBoldFont, hankenBoldFont] = await Promise.all(
    [
      bricolageUrl
        ? fetch(bricolageUrl).then((res) => res.arrayBuffer())
        : null,
      hankenSemiBoldUrl
        ? fetch(hankenSemiBoldUrl).then((res) => res.arrayBuffer())
        : null,
      hankenBoldUrl
        ? fetch(hankenBoldUrl).then((res) => res.arrayBuffer())
        : null,
    ]
  );

  if (!bricolageFont || !hankenSemiBoldFont || !hankenBoldFont) {
    return new Response("Font files not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: 40,
          color: "#1a3c5a",
          fontFamily: "Hanken Grotesk, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header with logo and title */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            marginBottom: 20,
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1a3c5a",
              display: "flex",
              alignItems: "flex-start",
              fontFamily: "Bricolage Grotesque, sans-serif",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a3c5a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span style={{ marginLeft: 8 }}>switch-to.eu</span>
          </div>
        </div>

        {/* Domain name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            marginBottom: 24,
            fontFamily: "Bricolage Grotesque, sans-serif",
            position: "relative",
            zIndex: 1,
          }}
        >
          {formattedDomain}
        </div>

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "60%",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              padding: 24,
              backgroundColor: "#f8fafc",
              marginRight: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {results.length > 0 ? (
                results.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 20,
                    }}
                  >
                    {getServiceIcon(step.type, step.isEU, step.euFriendly)}
                    <div style={{ flex: 1, display: "flex" }}>
                      {getServiceName(step.type)}
                    </div>
                    <div
                      style={{
                        color: getStatusColor(step.isEU, step.euFriendly),
                        fontWeight: "bold",
                        display: "flex",
                      }}
                    >
                      {getStatusText(step.isEU, step.euFriendly)}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    fontSize: 20,
                    color: "#64748b",
                    textAlign: "center",
                    padding: 16,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  Analysis pending or not available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Bricolage Grotesque",
          data: bricolageFont,
          weight: 800,
          style: "normal",
        },
        {
          name: "Hanken Grotesk",
          data: hankenSemiBoldFont,
          weight: 600,
          style: "normal",
        },
        {
          name: "Hanken Grotesk",
          data: hankenBoldFont,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
