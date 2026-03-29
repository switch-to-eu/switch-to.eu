import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_research_status" AS ENUM('not-started', 'in-progress', 'needs-update', 'complete');
  CREATE TYPE "public"."enum_services_gdpr_compliance" AS ENUM('compliant', 'partial', 'non-compliant', 'unknown');
  CREATE TABLE "categories_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar NOT NULL
  );
  
  CREATE TABLE "guides_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar NOT NULL
  );
  
  CREATE TABLE "pages_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar NOT NULL
  );
  
  CREATE TABLE "services_data_storage_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"location" varchar NOT NULL
  );
  
  CREATE TABLE "services_certifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"certification" varchar NOT NULL
  );
  
  CREATE TABLE "services_source_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "services_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar NOT NULL
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"services_find" boolean DEFAULT false,
  	"services_create" boolean DEFAULT false,
  	"services_update" boolean DEFAULT false,
  	"services_delete" boolean DEFAULT false,
  	"categories_find" boolean DEFAULT false,
  	"categories_create" boolean DEFAULT false,
  	"categories_update" boolean DEFAULT false,
  	"categories_delete" boolean DEFAULT false,
  	"guides_find" boolean DEFAULT false,
  	"guides_create" boolean DEFAULT false,
  	"guides_update" boolean DEFAULT false,
  	"guides_delete" boolean DEFAULT false,
  	"landing_pages_find" boolean DEFAULT false,
  	"landing_pages_create" boolean DEFAULT false,
  	"landing_pages_update" boolean DEFAULT false,
  	"landing_pages_delete" boolean DEFAULT false,
  	"pages_find" boolean DEFAULT false,
  	"pages_create" boolean DEFAULT false,
  	"pages_update" boolean DEFAULT false,
  	"pages_delete" boolean DEFAULT false,
  	"media_find" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  ALTER TABLE "categories" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "categories" ADD COLUMN "seo_score" numeric;
  ALTER TABLE "categories" ADD COLUMN "seo_notes" varchar;
  ALTER TABLE "categories" ADD COLUMN "last_seo_review_at" timestamp(3) with time zone;
  ALTER TABLE "categories_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "categories_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "categories_locales" ADD COLUMN "og_title" varchar;
  ALTER TABLE "categories_locales" ADD COLUMN "og_description" varchar;
  ALTER TABLE "guides" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "guides" ADD COLUMN "seo_score" numeric;
  ALTER TABLE "guides" ADD COLUMN "seo_notes" varchar;
  ALTER TABLE "guides" ADD COLUMN "last_seo_review_at" timestamp(3) with time zone;
  ALTER TABLE "guides_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "guides_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "guides_locales" ADD COLUMN "og_title" varchar;
  ALTER TABLE "guides_locales" ADD COLUMN "og_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "seo_score" numeric;
  ALTER TABLE "landing_pages" ADD COLUMN "seo_notes" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "last_seo_review_at" timestamp(3) with time zone;
  ALTER TABLE "landing_pages_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "landing_pages_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "pages" ADD COLUMN "seo_score" numeric;
  ALTER TABLE "pages" ADD COLUMN "seo_notes" varchar;
  ALTER TABLE "pages" ADD COLUMN "last_seo_review_at" timestamp(3) with time zone;
  ALTER TABLE "pages_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "og_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "og_description" varchar;
  ALTER TABLE "services" ADD COLUMN "research_status" "enum_services_research_status" DEFAULT 'not-started';
  ALTER TABLE "services" ADD COLUMN "last_researched_at" timestamp(3) with time zone;
  ALTER TABLE "services" ADD COLUMN "gdpr_compliance" "enum_services_gdpr_compliance" DEFAULT 'unknown';
  ALTER TABLE "services" ADD COLUMN "gdpr_notes" varchar;
  ALTER TABLE "services" ADD COLUMN "privacy_policy_url" varchar;
  ALTER TABLE "services" ADD COLUMN "pricing_details" varchar;
  ALTER TABLE "services" ADD COLUMN "pricing_url" varchar;
  ALTER TABLE "services" ADD COLUMN "headquarters" varchar;
  ALTER TABLE "services" ADD COLUMN "parent_company" varchar;
  ALTER TABLE "services" ADD COLUMN "founded_year" numeric;
  ALTER TABLE "services" ADD COLUMN "employee_count" varchar;
  ALTER TABLE "services" ADD COLUMN "open_source" boolean DEFAULT false;
  ALTER TABLE "services" ADD COLUMN "source_code_url" varchar;
  ALTER TABLE "services" ADD COLUMN "research_notes" jsonb;
  ALTER TABLE "services" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "services" ADD COLUMN "seo_score" numeric;
  ALTER TABLE "services" ADD COLUMN "seo_notes" varchar;
  ALTER TABLE "services" ADD COLUMN "last_seo_review_at" timestamp(3) with time zone;
  ALTER TABLE "services_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "og_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "og_description" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "categories_keywords" ADD CONSTRAINT "categories_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_keywords" ADD CONSTRAINT "guides_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_keywords" ADD CONSTRAINT "pages_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_data_storage_locations" ADD CONSTRAINT "services_data_storage_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_certifications" ADD CONSTRAINT "services_certifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_source_urls" ADD CONSTRAINT "services_source_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_keywords" ADD CONSTRAINT "services_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "categories_keywords_order_idx" ON "categories_keywords" USING btree ("_order");
  CREATE INDEX "categories_keywords_parent_id_idx" ON "categories_keywords" USING btree ("_parent_id");
  CREATE INDEX "categories_keywords_locale_idx" ON "categories_keywords" USING btree ("_locale");
  CREATE INDEX "guides_keywords_order_idx" ON "guides_keywords" USING btree ("_order");
  CREATE INDEX "guides_keywords_parent_id_idx" ON "guides_keywords" USING btree ("_parent_id");
  CREATE INDEX "guides_keywords_locale_idx" ON "guides_keywords" USING btree ("_locale");
  CREATE INDEX "pages_keywords_order_idx" ON "pages_keywords" USING btree ("_order");
  CREATE INDEX "pages_keywords_parent_id_idx" ON "pages_keywords" USING btree ("_parent_id");
  CREATE INDEX "pages_keywords_locale_idx" ON "pages_keywords" USING btree ("_locale");
  CREATE INDEX "services_data_storage_locations_order_idx" ON "services_data_storage_locations" USING btree ("_order");
  CREATE INDEX "services_data_storage_locations_parent_id_idx" ON "services_data_storage_locations" USING btree ("_parent_id");
  CREATE INDEX "services_certifications_order_idx" ON "services_certifications" USING btree ("_order");
  CREATE INDEX "services_certifications_parent_id_idx" ON "services_certifications" USING btree ("_parent_id");
  CREATE INDEX "services_source_urls_order_idx" ON "services_source_urls" USING btree ("_order");
  CREATE INDEX "services_source_urls_parent_id_idx" ON "services_source_urls" USING btree ("_parent_id");
  CREATE INDEX "services_keywords_order_idx" ON "services_keywords" USING btree ("_order");
  CREATE INDEX "services_keywords_parent_id_idx" ON "services_keywords" USING btree ("_parent_id");
  CREATE INDEX "services_keywords_locale_idx" ON "services_keywords" USING btree ("_locale");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  ALTER TABLE "categories" ADD CONSTRAINT "categories_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "categories_og_image_idx" ON "categories" USING btree ("og_image_id");
  CREATE INDEX "guides_og_image_idx" ON "guides" USING btree ("og_image_id");
  CREATE INDEX "landing_pages_og_image_idx" ON "landing_pages" USING btree ("og_image_id");
  CREATE INDEX "pages_og_image_idx" ON "pages" USING btree ("og_image_id");
  CREATE INDEX "services_og_image_idx" ON "services" USING btree ("og_image_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_data_storage_locations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_certifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_source_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_mcp_api_keys" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "categories_keywords" CASCADE;
  DROP TABLE "guides_keywords" CASCADE;
  DROP TABLE "pages_keywords" CASCADE;
  DROP TABLE "services_data_storage_locations" CASCADE;
  DROP TABLE "services_certifications" CASCADE;
  DROP TABLE "services_source_urls" CASCADE;
  DROP TABLE "services_keywords" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  ALTER TABLE "categories" DROP CONSTRAINT "categories_og_image_id_media_id_fk";
  
  ALTER TABLE "guides" DROP CONSTRAINT "guides_og_image_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_og_image_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_og_image_id_media_id_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_og_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk";
  
  DROP INDEX "categories_og_image_idx";
  DROP INDEX "guides_og_image_idx";
  DROP INDEX "landing_pages_og_image_idx";
  DROP INDEX "pages_og_image_idx";
  DROP INDEX "services_og_image_idx";
  DROP INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";
  DROP INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx";
  ALTER TABLE "categories" DROP COLUMN "og_image_id";
  ALTER TABLE "categories" DROP COLUMN "seo_score";
  ALTER TABLE "categories" DROP COLUMN "seo_notes";
  ALTER TABLE "categories" DROP COLUMN "last_seo_review_at";
  ALTER TABLE "categories_locales" DROP COLUMN "meta_title";
  ALTER TABLE "categories_locales" DROP COLUMN "meta_description";
  ALTER TABLE "categories_locales" DROP COLUMN "og_title";
  ALTER TABLE "categories_locales" DROP COLUMN "og_description";
  ALTER TABLE "guides" DROP COLUMN "og_image_id";
  ALTER TABLE "guides" DROP COLUMN "seo_score";
  ALTER TABLE "guides" DROP COLUMN "seo_notes";
  ALTER TABLE "guides" DROP COLUMN "last_seo_review_at";
  ALTER TABLE "guides_locales" DROP COLUMN "meta_title";
  ALTER TABLE "guides_locales" DROP COLUMN "meta_description";
  ALTER TABLE "guides_locales" DROP COLUMN "og_title";
  ALTER TABLE "guides_locales" DROP COLUMN "og_description";
  ALTER TABLE "landing_pages" DROP COLUMN "og_image_id";
  ALTER TABLE "landing_pages" DROP COLUMN "seo_score";
  ALTER TABLE "landing_pages" DROP COLUMN "seo_notes";
  ALTER TABLE "landing_pages" DROP COLUMN "last_seo_review_at";
  ALTER TABLE "landing_pages_locales" DROP COLUMN "meta_title";
  ALTER TABLE "landing_pages_locales" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "og_image_id";
  ALTER TABLE "pages" DROP COLUMN "seo_score";
  ALTER TABLE "pages" DROP COLUMN "seo_notes";
  ALTER TABLE "pages" DROP COLUMN "last_seo_review_at";
  ALTER TABLE "pages_locales" DROP COLUMN "meta_title";
  ALTER TABLE "pages_locales" DROP COLUMN "meta_description";
  ALTER TABLE "pages_locales" DROP COLUMN "og_title";
  ALTER TABLE "pages_locales" DROP COLUMN "og_description";
  ALTER TABLE "services" DROP COLUMN "research_status";
  ALTER TABLE "services" DROP COLUMN "last_researched_at";
  ALTER TABLE "services" DROP COLUMN "gdpr_compliance";
  ALTER TABLE "services" DROP COLUMN "gdpr_notes";
  ALTER TABLE "services" DROP COLUMN "privacy_policy_url";
  ALTER TABLE "services" DROP COLUMN "pricing_details";
  ALTER TABLE "services" DROP COLUMN "pricing_url";
  ALTER TABLE "services" DROP COLUMN "headquarters";
  ALTER TABLE "services" DROP COLUMN "parent_company";
  ALTER TABLE "services" DROP COLUMN "founded_year";
  ALTER TABLE "services" DROP COLUMN "employee_count";
  ALTER TABLE "services" DROP COLUMN "open_source";
  ALTER TABLE "services" DROP COLUMN "source_code_url";
  ALTER TABLE "services" DROP COLUMN "research_notes";
  ALTER TABLE "services" DROP COLUMN "og_image_id";
  ALTER TABLE "services" DROP COLUMN "seo_score";
  ALTER TABLE "services" DROP COLUMN "seo_notes";
  ALTER TABLE "services" DROP COLUMN "last_seo_review_at";
  ALTER TABLE "services_locales" DROP COLUMN "meta_title";
  ALTER TABLE "services_locales" DROP COLUMN "meta_description";
  ALTER TABLE "services_locales" DROP COLUMN "og_title";
  ALTER TABLE "services_locales" DROP COLUMN "og_description";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";
  DROP TYPE "public"."enum_services_research_status";
  DROP TYPE "public"."enum_services_gdpr_compliance";`)
}
