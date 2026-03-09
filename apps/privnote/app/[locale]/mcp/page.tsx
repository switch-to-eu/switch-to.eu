import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Bot, Terminal } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

export default async function McpPage() {
  const t = await getTranslations("McpPage");
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:5016";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const mcpUrl = `${protocol}://${host}/api/mcp/mcp`;

  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-4xl">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl uppercase text-foreground">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(["aiPowered", "encrypted", "open"] as const).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-tool-surface/10 px-4 py-1.5 text-sm font-medium text-tool-primary border border-tool-accent/20"
              >
                {t(`hero.badges.${badge}`)}
              </span>
            ))}
          </div>
        </div>

        {/* What is MCP */}
        <div className="mb-16">
          <h2 className="mb-4 font-heading text-2xl sm:text-3xl uppercase text-foreground">
            {t("whatIsMcp.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("whatIsMcp.description")}
          </p>
        </div>

        {/* Available Tools */}
        <div className="mb-16">
          <h2 className="mb-8 font-heading text-2xl sm:text-3xl uppercase text-foreground">
            {t("tools.title")}
          </h2>
          <div className="rounded-xl border border-border bg-muted p-6">
            <div className="flex items-start gap-4">
              <Bot className="mt-1 h-8 w-8 flex-shrink-0 text-tool-primary" />
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  create_privnote
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {t("tools.createPrivnote.description")}
                </p>
                <div className="space-y-2">
                  {(["content", "expiry", "burnAfterReading", "password"] as const).map(
                    (param) => (
                      <div key={param} className="flex gap-2 text-sm">
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-foreground">
                          {param}
                        </code>
                        <span className="text-muted-foreground">
                          {t(`tools.createPrivnote.params.${param}`)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mb-16 space-y-10">
          <h2 className="mb-8 font-heading text-2xl sm:text-3xl uppercase text-foreground">
            {t("setup.title")}
          </h2>

          {/* Streamable HTTP */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Terminal className="h-6 w-6 text-tool-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                {t("setup.streamableHttp.title")}
              </h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("setup.streamableHttp.description")}
            </p>
            <CodeBlock>{`{
  "mcpServers": {
    "privnote": {
      "url": "${mcpUrl}"
    }
  }
}`}</CodeBlock>
          </div>

          {/* Stdio bridge */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Terminal className="h-6 w-6 text-tool-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                {t("setup.stdio.title")}
              </h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("setup.stdio.description")}
            </p>
            <CodeBlock>{`{
  "mcpServers": {
    "privnote": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${mcpUrl}"
      ]
    }
  }
}`}</CodeBlock>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("setup.stdio.note")}
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mb-16 rounded-xl border border-tool-accent/20 bg-tool-surface/10 p-6">
          <h3 className="mb-2 font-semibold text-tool-primary">
            {t("security.title")}
          </h3>
          <p className="text-sm text-tool-primary leading-relaxed">
            {t("security.description")}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/create">
            <Button size="lg" className="gradient-primary border-0 text-white">
              {t("cta")}
            </Button>
          </Link>
        </div>
      </Container>
    </PageLayout>
  );
}
