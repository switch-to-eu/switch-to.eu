import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Bot, Terminal, Copy, Check, Settings, Globe } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

export default function McpPage() {
  const t = useTranslations("McpPage");

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{t("hero.subtitle")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(["aiPowered", "encrypted", "open"] as const).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 border border-amber-200"
              >
                {t(`hero.badges.${badge}`)}
              </span>
            ))}
          </div>
        </div>

        {/* What is MCP */}
        <div className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {t("whatIsMcp.title")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t("whatIsMcp.description")}
          </p>
        </div>

        {/* Available Tools */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            {t("tools.title")}
          </h2>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
            <div className="flex items-start gap-4">
              <Bot className="mt-1 h-8 w-8 flex-shrink-0 text-amber-600" />
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  create_privnote
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {t("tools.createPrivnote.description")}
                </p>
                <div className="space-y-2">
                  {(["content", "expiry", "burnAfterReading", "password"] as const).map(
                    (param) => (
                      <div key={param} className="flex gap-2 text-sm">
                        <code className="rounded bg-gray-200 px-2 py-0.5 font-mono text-gray-800">
                          {param}
                        </code>
                        <span className="text-gray-600">
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
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            {t("setup.title")}
          </h2>

          {/* Claude Desktop */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Terminal className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                {t("setup.claudeDesktop.title")}
              </h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              {t("setup.claudeDesktop.description")}
            </p>
            <CodeBlock>{`// claude_desktop_config.json
{
  "mcpServers": {
    "privnote": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-privnote-url/api/mcp/mcp"
      ]
    }
  }
}`}</CodeBlock>
            <p className="mt-3 text-xs text-gray-500">
              {t("setup.claudeDesktop.note")}
            </p>
          </div>

          {/* Cursor / Windsurf */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Settings className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                {t("setup.cursor.title")}
              </h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              {t("setup.cursor.description")}
            </p>
            <CodeBlock>{`// .cursor/mcp.json or .windsurf/mcp.json
{
  "mcpServers": {
    "privnote": {
      "url": "https://your-privnote-url/api/mcp/mcp"
    }
  }
}`}</CodeBlock>
          </div>

          {/* Claude Code */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Terminal className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                {t("setup.claudeCode.title")}
              </h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              {t("setup.claudeCode.description")}
            </p>
            <CodeBlock>{`// .mcp.json
{
  "mcpServers": {
    "privnote": {
      "type": "url",
      "url": "https://your-privnote-url/api/mcp/mcp"
    }
  }
}`}</CodeBlock>
          </div>
        </div>

        {/* Security Note */}
        <div className="mb-16 rounded-xl border border-amber-200 bg-amber-50/50 p-6">
          <h3 className="mb-2 font-semibold text-amber-800">
            {t("security.title")}
          </h3>
          <p className="text-sm text-amber-700 leading-relaxed">
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
      </div>
    </div>
  );
}
