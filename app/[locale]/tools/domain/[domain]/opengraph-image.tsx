import { ImageResponse } from "next/og";
import { getFromRedis } from "@/lib/redis";
import { AnalysisStep } from "@/lib/types";

// Image metadata
export const alt = "Domain EU Compliance Analysis";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Helper to format domain name
function formatDomain(domain: string) {
  return domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
}

// Get service icon component based on type
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

// Get service name based on type
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

// Get EU compliance status text
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

// Get color for status text
function getStatusColor(isEU: boolean | null, euFriendly: boolean | null) {
  if (isEU === true || euFriendly === true) {
    return "#15803d";
  } else if (isEU === false && euFriendly === false) {
    return "#b91c1c";
  }
  return "#64748b";
}

// Image generation
export default async function Image({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const formattedDomain = formatDomain(domain);

  // Try to get cached results from Redis
  const cachedResults = await getFromRedis(`domain:${domain}`);

  // Parse the cached results if they exist
  const results = cachedResults
    ? (JSON.parse(cachedResults as string) as AnalysisStep[])
    : [];

  // Load font files directly from Google Fonts
  const bricolageGrotesque = await fetch(
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&display=swap"
  ).then((res) => res.text());

  const hankenGroteskSemiBold = await fetch(
    "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600&display=swap"
  ).then((res) => res.text());

  const hankenGroteskBold = await fetch(
    "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@700&display=swap"
  ).then((res) => res.text());

  // Extract font URLs
  const bricolageUrl = bricolageGrotesque.match(/url\((.*?)\)/)?.[1];
  const hankenSemiBoldUrl = hankenGroteskSemiBold.match(/url\((.*?)\)/)?.[1];
  const hankenBoldUrl = hankenGroteskBold.match(/url\((.*?)\)/)?.[1];

  // Fetch font data
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

  console.log(bricolageFont, hankenSemiBoldFont, hankenBoldFont);

  if (!bricolageFont || !hankenSemiBoldFont || !hankenBoldFont) {
    return new Response("Font files not found", { status: 404 });
  }

  // Europe SVG (simplified and adapted for rendering)
  const EuropeSvg = () => (
    <svg
      width="630"
      viewBox="0 0 318.26 264.89"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        right: "20px",
        bottom: "20px",
        opacity: 0.2,
      }}
    >
      <path
        d="M125.5,200.34c-3.62,16.35,31.44,26.04,21.42,42.92-8.08,13.6-28.51-6.09-34.25-13.59-4.77-6.23-11.03-22.78-20.21-19.89-7.26,2.28-16.56,21.89-23.47,28.55-19.76,19.06-60.44,19.42-68.22-10.77-3.99-15.48,8.07-40.3,26.25-38.25,6.34.71,14.32,9.64,20.52,3.56,7.78-7.63-5.17-22.88,4.96-34.03,10.8-11.88,44.47-14.76,51.4-25.6,2.84-4.44,2.84-11.78,9.35-12.74,7.66-1.13,8.1,11.72,13.18,13.39,10.23,3.37,29.66-7.03,36.6-14.52,3.61-3.89,6.13-12.77,8.93-15.07,3.28-2.7,8.65-1.33,12.44-3.05-1.13-11.47-13.67-8-13.99-21.4-.04-1.85,1.91-9.53-.42-9.49-5.08,3.55-10.47,9.18-11.42,15.56-1.1,7.41.3,13.02-3.65,20.35-3.29,6.11-19.75,19.07-26.48,14.6-1.88-1.25-.47-6.72-6.95-10.05-10.7-5.48-23.07,1.68-25.76-15.23-4.55-28.54,27.44-37.35,42.79-51.72C157.31,26.3,160.36-3.45,194,.33c8.1.91,28.9,12,32.69,19.31,3.57,6.89,1.01,11.67-2.78,17.62s-12.99,10.82-5.34,17.51c6.28,5.49,17.78,4.66,23.47-1.37,7.39-7.83,2.98-21.66,11.42-28.58,7.99-6.54,28.58-1.6,38.24.82,10.15,2.54,21.13,4.72,26.01,14.99l.55,125.99c-3.56,12.05-13.12,9.2-21.99,12.01-10.03,3.18-10.26,15.21-14.61,23.39-8.15,15.31-21.44,13.34-34.1,4.76-7.81-5.3-12.94-16.71-22.56-7.42-6.39,6.16-4.89,14.14-7.99,21.01-4.37,9.66-19.37,9.16-28.09,11.91-2.96,4.09,7.6,9.56,8.53,14.63,2.54,13.76-18,22.14-27.91,15.9-11.65-7.33-9.5-25.72-14.85-37.15-2.65-5.65-7.98-11.25-12.72-15.28-1.86-1.58-15.14-11.41-16.47-10.02Z"
        fill="#383838"
      />
      <path
        d="M49.22,89.51c11.71-2.51,7.44,19.8,11.22,22.38,2.74,1.88,8.59-3.41,12.35-1.37,11.79,10.06-3.8,16.81-10.78,22.83-8.98,7.75-15.67,17.67-29.8,14.74s-17.25-30.31-10.73-40.28c3.64-5.56,8.29-3.42,9.07-3.94,1.25-.84,1.82-6.76,4.96-9.02,4.93-3.56,6.21.28,7.5.31,1.16.02,2.75-4.91,6.22-5.66Z"
        fill="#383838"
      />
      <path
        d="M131.75,115.07c-1.38-1.16-1.12-4.12-5.01-6.48-13.01-7.89-29.28,1.67-26.16-21.67,2.47-18.45,26.97-28.56,39.44-39.56,19.07-16.82,25.04-49.25,56.51-41.56,6.97,1.7,24.8,10.05,26.73,17.28,3.59,13.52-21.59,21.27-8.66,33.66,6.45,6.18,20.01,7.78,27.41,2.6,12.34-8.62,6.23-25.37,14.99-31.01,7.87-5.06,29.27,0,38.29,2.72,6.4,1.93,16.85,4.99,18.75,12.25l.52,117.58c-3.24,20.33-22.37,6.03-30.91,24.09-5.95,12.6-7.23,29.78-27.38,22.09-11.97-4.57-18.76-23.5-33.11-11.58-9.12,7.57-6.35,20.15-11.6,25.4-6.57,6.58-26.26,2.99-26.76,13.1-.38,7.66,13.44,11.44,5.23,21.37-5.89,7.12-16.93,6.89-22.52-.53-7.31-9.71-3.72-25.25-11.57-36.43-2.9-4.13-22.96-21.14-27.17-21.91-8.98-1.64-8.06,7.07-6,13.08,4.35,12.68,25.62,17.66,20.76,32.29-3.21,2.29-6.09,1.56-9.58.52-18.02-5.36-24.69-36.19-37.96-37.11-12.52-.86-17.88,15.46-24.52,23.53-13.77,16.75-40.52,27.51-58.49,10.55-12.2-11.51-10.43-34.58,3.57-43.48,12.83-8.15,20.46,7.75,30.87,1.87,13.79-7.79.58-23.89,7.08-33.92,8.49-13.11,42.25-15.02,51.98-27.02,2.54-3.13,5.21-15.79,10.08-10.02,2.71,3.21.77,7.99,6.38,10.61,13.21,6.16,36.46-6.88,44.54-17.59,2.48-3.29,4.73-10.49,8.04-11.96,4.47-1.98,16.74,1.31,13.32-10.33-2.49-8.46-12.03-9.23-13.82-13.2-2.15-4.77,1.48-11.26.45-16.46-2.13-10.72-17.92,8.1-19.87,13.08-2.33,5.97-.72,14.01-3.62,21.38-2.21,5.62-14.21,17.79-20.22,12.76Z"
        fill="#c5e1c6"
      />
      <path
        d="M57.78,117.04c3.59,3.13,18.04-8.59,14.54,2.61-.5,1.59-23.01,20.11-25.51,21.52-18.99,10.69-27.18-8.57-23.88-24.88.34-1.7,2.85-8.37,5.04-7.94,1.52.24,2.29,16.82,6.05,11.03,1.54-2.37-.04-16.96,3.48-21.03,6.81.52-1.22,8.93,4.47,9.99,3.06-3.31,2.83-7.69,5.68-11.33.9-1.15,2.07-3.59,3.87-2.2,3.14,2.43,1.35,17.95,6.26,22.24Z"
        fill="#c5e1c6"
      />
      <path
        d="M213.22,136.51c9.86-2.08,12.2,16.19,2.72,17.83-10.04,1.74-13.41-15.57-2.72-17.83Z"
        fill="#383838"
      />
      <path
        d="M175.21,136.53c10.8-3.21,13.53,13.9,4.57,16.61-10.34,3.13-12.35-14.3-4.57-16.61Z"
        fill="#383838"
      />
      <path
        d="M208.49,162.34c.3,10.92-16.82,13.07-25.01,10.51-4.45-1.39-15.33-9.2-5.62-9.52,4.69,6.2,14.48,7.65,21.53,4.4,4.08-1.88,4.32-6.36,9.1-5.39Z"
        fill="#383838"
      />
    </svg>
  );

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
        {/* Europe SVG Background */}
        <EuropeSvg />

        {/* Header with logo and title */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            marginBottom: 20,
            width: "100%",
            position: "relative", // Ensure this is above the background
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

        {/* Content container - align left */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Domain analysis results - left side */}
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
            {/* Services list */}
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
