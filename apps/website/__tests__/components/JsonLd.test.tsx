import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JsonLd } from "@/components/JsonLd";

describe("JsonLd", () => {
  it("does not let a value end the script element", () => {
    const value = "</script><script>alert(1)</script>";
    const html = renderToStaticMarkup(<JsonLd data={{ name: value }} />);

    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);

    const body = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(body)).toEqual({ name: value });
  });
});
