import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Bot, Terminal, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

function ToolCard({
  name,
  description,
  params,
}: {
  name: string;
  description: string;
  params: { name: string; description: string }[];
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
      <div className="flex items-start gap-4">
        <Bot className="mt-1 h-8 w-8 flex-shrink-0 text-rose-600" />
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{name}</h3>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
          {params.length > 0 && (
            <div className="space-y-2">
              {params.map((param) => (
                <div key={param.name} className="flex gap-2 text-sm">
                  <code className="rounded bg-gray-200 px-2 py-0.5 font-mono text-gray-800">
                    {param.name}
                  </code>
                  <span className="text-gray-600">{param.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function McpPage() {
  const t = await getTranslations("McpPage");
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:5018";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const mcpUrl = `${protocol}://${host}/api/mcp/mcp`;

  const tools = [
    {
      name: "create_quiz",
      descriptionKey: "tools.createQuiz.description" as const,
      params: ["title", "description", "questions", "timerSeconds", "expirationHours"] as const,
    },
    {
      name: "get_quiz",
      descriptionKey: "tools.getQuiz.description" as const,
      params: ["adminUrl"] as const,
    },
    {
      name: "add_question",
      descriptionKey: "tools.addQuestion.description" as const,
      params: ["adminUrl", "text", "options", "correctIndex", "timerOverride"] as const,
    },
    {
      name: "update_question",
      descriptionKey: "tools.updateQuestion.description" as const,
      params: ["adminUrl", "index", "text", "options", "correctIndex", "timerOverride"] as const,
    },
    {
      name: "remove_question",
      descriptionKey: "tools.removeQuestion.description" as const,
      params: ["adminUrl", "index"] as const,
    },
    {
      name: "delete_quiz",
      descriptionKey: "tools.deleteQuiz.description" as const,
      params: ["adminUrl"] as const,
    },
  ];

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
                className="rounded-full bg-rose-50 px-4 py-1.5 text-sm font-medium text-rose-700 border border-rose-200"
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
          <div className="space-y-4">
            {tools.map((tool) => (
              <ToolCard
                key={tool.name}
                name={tool.name}
                description={t(tool.descriptionKey)}
                params={tool.params.map((param) => ({
                  name: param,
                  description: t(`tools.params.${param}`),
                }))}
              />
            ))}
          </div>
        </div>

        {/* Admin Key Warning */}
        <div className="mb-16 rounded-xl border border-rose-200 bg-rose-50/50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-700" />
            <div>
              <h3 className="mb-2 font-semibold text-rose-800">
                {t("adminKey.title")}
              </h3>
              <p className="text-sm text-rose-700 leading-relaxed">
                {t("adminKey.description")}
              </p>
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
              <Terminal className="h-6 w-6 text-rose-600" />
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
    "quiz": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${mcpUrl}"
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
              <Settings className="h-6 w-6 text-rose-600" />
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
    "quiz": {
      "url": "${mcpUrl}"
    }
  }
}`}</CodeBlock>
          </div>

          {/* Claude Code */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Terminal className="h-6 w-6 text-rose-600" />
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
    "quiz": {
      "type": "url",
      "url": "${mcpUrl}"
    }
  }
}`}</CodeBlock>
          </div>
        </div>

        {/* Security Note */}
        <div className="mb-16 rounded-xl border border-rose-200 bg-rose-50/50 p-6">
          <h3 className="mb-2 font-semibold text-rose-800">
            {t("security.title")}
          </h3>
          <p className="text-sm text-rose-700 leading-relaxed">
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
