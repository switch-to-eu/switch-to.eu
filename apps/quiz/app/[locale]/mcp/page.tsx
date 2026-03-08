import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Bot, Terminal, AlertTriangle } from "lucide-react";
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
    <div className="rounded-xl border border-border bg-muted p-6">
      <div className="flex items-start gap-4">
        <Bot className="mt-1 h-8 w-8 flex-shrink-0 text-tool-primary" />
        <div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">{name}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{description}</p>
          {params.length > 0 && (
            <div className="space-y-2">
              {params.map((param) => (
                <div key={param.name} className="flex gap-2 text-sm">
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-foreground">
                    {param.name}
                  </code>
                  <span className="text-muted-foreground">{param.description}</span>
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
    <div className="bg-card">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(["aiPowered", "encrypted", "open"] as const).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-tool-primary/10 px-4 py-1.5 text-sm font-medium text-tool-primary border border-tool-primary/20"
              >
                {t(`hero.badges.${badge}`)}
              </span>
            ))}
          </div>
        </div>

        {/* What is MCP */}
        <div className="mb-16">
          <h2 className="mb-4 font-heading text-2xl sm:text-3xl uppercase text-brand-green">
            {t("whatIsMcp.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("whatIsMcp.description")}
          </p>
        </div>

        {/* Available Tools */}
        <div className="mb-16">
          <h2 className="mb-8 font-heading text-2xl sm:text-3xl uppercase text-brand-green">
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
        <div className="mb-16 rounded-xl border border-tool-primary/20 bg-tool-primary/10/50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-tool-primary" />
            <div>
              <h3 className="mb-2 font-semibold text-tool-primary">
                {t("adminKey.title")}
              </h3>
              <p className="text-sm text-tool-primary leading-relaxed">
                {t("adminKey.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mb-16 space-y-10">
          <h2 className="mb-8 font-heading text-2xl sm:text-3xl uppercase text-brand-green">
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
    "quiz": {
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
    "quiz": {
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
        <div className="mb-16 rounded-xl border border-tool-primary/20 bg-tool-primary/10/50 p-6">
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
      </div>
    </div>
  );
}
