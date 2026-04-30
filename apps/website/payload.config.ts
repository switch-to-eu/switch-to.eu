import { fileURLToPath } from "node:url";
import path from "path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { en } from "@payloadcms/translations/languages/en";
import { nl } from "@payloadcms/translations/languages/nl";
import {
  Categories,
  ContentOpportunities,
  Guides,
  LandingPages,
  Media,
  PageAudits,
  Pages,
  Services,
  Users,
} from "./collections";
import { wipeContentTool } from "./mcp/wipeContentTool";
import { replaceLinkInDocTool } from "./mcp/replaceLinkInDocTool";
import { jinaSearchTool } from "./mcp/jinaSearchTool";
import { jinaReadTool } from "./mcp/jinaReadTool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(__dirname),
    },
    components: {
      beforeDashboard: [
        "/components/admin/IndexNowButton",
        "/components/admin/RevalidateCachesButton",
      ],
    },
  },
  db: postgresAdapter({
    pool: {
      // Migrations use the unpooled connection because pgbouncer/transaction
      // poolers reject DDL statements; runtime falls back to the pooled URL.
      connectionString:
        process.env.PAYLOAD_MIGRATING === "true"
          ? (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!)
          : process.env.DATABASE_URL!,
    },
    migrationDir: path.resolve(__dirname, "migrations"),
  }),
  editor: lexicalEditor(),
  localization: {
    locales: [
      { label: { en: "English", nl: "Engels" }, code: "en" },
      { label: { en: "Dutch", nl: "Nederlands" }, code: "nl" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  i18n: {
    supportedLanguages: { en, nl },
    fallbackLanguage: "en",
  },
  collections: [Categories, ContentOpportunities, Guides, LandingPages, Media, PageAudits, Pages, Services, Users],
  plugins: [
    mcpPlugin({
      collections: {
        services: { enabled: true },
        categories: { enabled: true },
        guides: { enabled: true },
        "landing-pages": { enabled: true },
        pages: { enabled: true },
        "page-audits": { enabled: true },
        "content-opportunities": { enabled: true },
        media: {
          enabled: {
            find: true,
            create: false,
            update: false,
            delete: false,
          },
        },
      },
      mcp: {
        tools: [
          wipeContentTool,
          replaceLinkInDocTool,
          jinaSearchTool,
          jinaReadTool,
        ],
      },
    }),
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: {
                prefix: process.env.VERCEL_ENV ?? "local",
                disablePayloadAccessControl: true,
              },
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
});
