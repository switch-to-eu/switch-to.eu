import { fileURLToPath } from "node:url";
import path from "path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { en } from "@payloadcms/translations/languages/en";
import { nl } from "@payloadcms/translations/languages/nl";
import {
  Categories,
  Guides,
  LandingPages,
  Media,
  Pages,
  Services,
} from "./collections";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(__dirname),
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
  collections: [Categories, Guides, LandingPages, Media, Pages, Services],
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
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
