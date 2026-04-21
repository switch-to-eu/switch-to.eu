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
  Guides,
  LandingPages,
  Media,
  PageAudits,
  Pages,
  Services,
  Users,
} from "./collections";
import { wipeContentTool } from "./mcp/wipeContentTool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(__dirname),
    },
    components: {
      beforeDashboard: ["/components/admin/IndexNowButton"],
    },
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL! },
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
  collections: [Categories, Guides, LandingPages, Media, PageAudits, Pages, Services, Users],
  plugins: [
    mcpPlugin({
      collections: {
        services: { enabled: true },
        categories: { enabled: true },
        guides: { enabled: true },
        "landing-pages": { enabled: true },
        pages: { enabled: true },
        "page-audits": { enabled: true },
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
        tools: [wipeContentTool],
      },
    }),
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: {
                prefix: process.env.VERCEL_ENV ?? "local",
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
