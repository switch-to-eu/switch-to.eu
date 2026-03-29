import { ImageResponse } from "next/og";
import { getOgFonts, ogFontConfig } from "./fonts";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Star shape path (from public/images/shapes/star.svg, viewBox 0 0 404.24 345.61)
const starPath =
  "M403.1,159c-36.5-5.22-73.11-9.66-109.8-13.26-16.45-1.61-33.27-3.5-49.99-3.84-2.54-47.87-11.42-95.24-26.43-140.78-.44-1.35-2.1-1.49-2.9-.38-30.31,42.65-54.54,89.34-72.03,138.61-47.38-.12-94.69,5.45-140.81,16.56-1.59.38-1.43,2.6,0,3.06,40.68,13.15,81.36,26.31,122.03,39.46-34.07,44.07-61.47,93.07-81.17,145.27-.62,1.64,1.56,2.43,2.64,1.54,41.98-34.3,83.96-68.61,125.94-102.92,35.62,35.89,77.39,65.42,123.19,87.02,1.22.58,2.72-.37,2.34-1.79-10.74-40.12-21.49-80.24-32.22-120.34,47.79-10.79,94.52-25.96,139.59-45.32,1.21-.52.93-2.71-.37-2.9Z";

// Blob shape path (from public/images/shapes/blob.svg, viewBox 0 0 362.94 366)
const blobPath =
  "M166.52,360.05c-19.36-8.03-41.21-5.87-62.05-8.18-20.83-2.31-43.84-11.92-49.96-31.97-5.04-16.53,3.15-34.97-2.06-51.44-7.81-24.66-41.25-33.37-50.23-57.63-5.76-15.55.46-33.1,9.58-46.95,9.12-13.85,21.14-25.78,28.87-40.45,9.68-18.35,11.97-39.62,18.8-59.21,6.84-19.59,20.83-39.25,41.35-42.33,16.4-2.46,32.59,6.32,49.17,5.87,18.39-.5,34.31-12.06,50.84-20.14,16.53-8.08,38.34-12.16,51.86.32,10.92,10.08,12.24,27.37,22.51,38.11,10.86,11.35,28.27,12.28,43.85,14.26,15.58,1.98,33.43,7.89,38.23,22.84,3.89,12.1-2.62,24.95-9.81,35.44-7.19,10.48-15.61,21.27-16.03,33.97-.48,14.6,9.66,27.06,18.34,38.81,8.68,11.75,16.7,26.67,11.52,40.33-4.55,12-17.57,18.24-29.7,22.43-12.13,4.19-25.41,8.09-33.15,18.33-7.32,9.68-7.87,22.65-10.36,34.53-2.49,11.88-9.05,24.89-20.98,27.1-9.14,1.69-18.26-3.67-27.54-3.14-9.6.55-17.69,7.25-24.25,14.28-6.56,7.04-12.63,14.95-21.2,19.33-8.56,4.38-17.86-2.34-27.61-4.49";

interface OgImageOptions {
  title: string;
  subtitle?: string;
  badge?: string;
}

export async function generateOgImage({ title, subtitle, badge }: OgImageOptions) {
  const fonts = await getOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1E42B0",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Hanken Grotesk, sans-serif",
        }}
      >
        {/* Decorative star shape - top right */}
        <svg
          viewBox="0 0 404.24 345.61"
          width="280"
          height="240"
          style={{
            position: "absolute",
            top: -30,
            right: -20,
            opacity: 0.12,
          }}
        >
          <path d={starPath} fill="white" />
        </svg>

        {/* Decorative blob shape - bottom left */}
        <svg
          viewBox="0 0 362.94 366"
          width="260"
          height="260"
          style={{
            position: "absolute",
            bottom: -40,
            left: -30,
            opacity: 0.08,
          }}
        >
          <path d={blobPath} fill="white" />
        </svg>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: "48px 56px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top: Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: "white",
                fontFamily: "Bonbance, serif",
                fontWeight: 800,
                letterSpacing: "0.02em",
              }}
            >
              switch-to.eu
            </div>
          </div>

          {/* Middle: Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {badge && (
              <div
                style={{
                  display: "flex",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#FBA616",
                    color: "#1E42B0",
                    fontSize: 16,
                    fontWeight: 700,
                    padding: "6px 20px",
                    borderRadius: 999,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {badge}
                </div>
              </div>
            )}

            <div
              style={{
                fontSize: title.length > 40 ? 48 : title.length > 25 ? 56 : 64,
                color: "#FBA616",
                fontFamily: "Bonbance, serif",
                fontWeight: 800,
                lineHeight: 1.1,
                textTransform: "uppercase",
                maxWidth: "90%",
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  fontSize: 24,
                  color: "#9BCDD0",
                  lineHeight: 1.4,
                  maxWidth: "80%",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          {/* Bottom: Yellow accent bar */}
          <div
            style={{
              display: "flex",
              width: 80,
              height: 4,
              backgroundColor: "#FBA616",
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: ogFontConfig(fonts),
    }
  );
}
