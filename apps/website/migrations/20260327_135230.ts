import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_version_steps_video_orientation" AS ENUM('landscape', 'portrait');
  CREATE TYPE "public"."enum__guides_v_version_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_landing_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_pages_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_region" AS ENUM('eu', 'non-eu', 'eu-friendly');
  CREATE TYPE "public"."enum__services_v_version_research_status" AS ENUM('not-started', 'in-progress', 'needs-update', 'complete');
  CREATE TYPE "public"."enum__services_v_version_gdpr_compliance" AS ENUM('compliant', 'partial', 'non-compliant', 'unknown');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('en', 'nl');
  CREATE TABLE "_guides_v_version_missing_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"video" varchar,
  	"video_orientation" "enum__guides_v_version_steps_video_orientation" DEFAULT 'landscape',
  	"complete" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v_version_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"keyword" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_difficulty" "enum__guides_v_version_difficulty",
  	"version_time_required" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_category_id" integer,
  	"version_source_service_id" integer,
  	"version_target_service_id" integer,
  	"version_author" varchar,
  	"version_og_image_id" integer,
  	"version_seo_score" numeric,
  	"version_seo_notes" varchar,
  	"version_last_seo_review_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__guides_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_guides_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_intro" jsonb,
  	"version_before_you_start" jsonb,
  	"version_troubleshooting" jsonb,
  	"version_outro" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_og_title" varchar,
  	"version_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_landing_pages_v_version_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"keyword" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_related_service_id" integer,
  	"version_og_image_id" integer,
  	"version_seo_score" numeric,
  	"version_seo_notes" varchar,
  	"version_last_seo_review_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__landing_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__landing_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_landing_pages_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_og_title" varchar,
  	"version_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_landing_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "_pages_v_version_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"keyword" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_og_image_id" integer,
  	"version_seo_score" numeric,
  	"version_seo_notes" varchar,
  	"version_last_seo_review_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_og_title" varchar,
  	"version_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_issues" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"issue" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_data_storage_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"location" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_certifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"certification" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_source_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"keyword" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_region" "enum__services_v_version_region",
  	"version_featured" boolean DEFAULT false,
  	"version_category_id" integer,
  	"version_location" varchar,
  	"version_free_option" boolean DEFAULT false,
  	"version_url" varchar,
  	"version_screenshot_id" integer,
  	"version_logo_id" integer,
  	"version_recommended_alternative_id" integer,
  	"version_research_status" "enum__services_v_version_research_status" DEFAULT 'not-started',
  	"version_last_researched_at" timestamp(3) with time zone,
  	"version_gdpr_compliance" "enum__services_v_version_gdpr_compliance" DEFAULT 'unknown',
  	"version_gdpr_notes" varchar,
  	"version_privacy_policy_url" varchar,
  	"version_pricing_details" varchar,
  	"version_pricing_url" varchar,
  	"version_headquarters" varchar,
  	"version_parent_company" varchar,
  	"version_founded_year" numeric,
  	"version_employee_count" varchar,
  	"version_open_source" boolean DEFAULT false,
  	"version_source_code_url" varchar,
  	"version_research_notes" jsonb,
  	"version_og_image_id" integer,
  	"version_seo_score" numeric,
  	"version_seo_notes" varchar,
  	"version_last_seo_review_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_name" varchar,
  	"version_starting_price" varchar,
  	"version_description" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_og_title" varchar,
  	"version_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "guides_missing_features" ALTER COLUMN "feature" DROP NOT NULL;
  ALTER TABLE "guides_steps" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "guides_steps" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "guides_keywords" ALTER COLUMN "keyword" DROP NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "difficulty" DROP NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "time_required" DROP NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "category_id" DROP NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "source_service_id" DROP NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "target_service_id" DROP NOT NULL;
  ALTER TABLE "guides_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "guides_locales" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "landing_pages_keywords" ALTER COLUMN "keyword" DROP NOT NULL;
  ALTER TABLE "landing_pages" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "landing_pages_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "landing_pages_locales" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "pages_keywords" ALTER COLUMN "keyword" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "pages_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_locales" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "services_features" ALTER COLUMN "feature" DROP NOT NULL;
  ALTER TABLE "services_tags" ALTER COLUMN "tag" DROP NOT NULL;
  ALTER TABLE "services_data_storage_locations" ALTER COLUMN "location" DROP NOT NULL;
  ALTER TABLE "services_certifications" ALTER COLUMN "certification" DROP NOT NULL;
  ALTER TABLE "services_source_urls" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "services_keywords" ALTER COLUMN "keyword" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "region" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "category_id" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "location" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "guides" ADD COLUMN "_status" "enum_guides_status" DEFAULT 'draft';
  ALTER TABLE "landing_pages" ADD COLUMN "_status" "enum_landing_pages_status" DEFAULT 'draft';
  ALTER TABLE "pages" ADD COLUMN "_status" "enum_pages_status" DEFAULT 'draft';
  ALTER TABLE "services" ADD COLUMN "_status" "enum_services_status" DEFAULT 'draft';
  ALTER TABLE "_guides_v_version_missing_features" ADD CONSTRAINT "_guides_v_version_missing_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_steps" ADD CONSTRAINT "_guides_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_keywords" ADD CONSTRAINT "_guides_v_version_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_source_service_id_services_id_fk" FOREIGN KEY ("version_source_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_target_service_id_services_id_fk" FOREIGN KEY ("version_target_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_locales" ADD CONSTRAINT "_guides_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_version_keywords" ADD CONSTRAINT "_landing_pages_v_version_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_parent_id_landing_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_version_related_service_id_services_id_fk" FOREIGN KEY ("version_related_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_locales" ADD CONSTRAINT "_landing_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_rels" ADD CONSTRAINT "_landing_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_rels" ADD CONSTRAINT "_landing_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_keywords" ADD CONSTRAINT "_pages_v_version_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_features" ADD CONSTRAINT "_services_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_tags" ADD CONSTRAINT "_services_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_issues" ADD CONSTRAINT "_services_v_version_issues_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_data_storage_locations" ADD CONSTRAINT "_services_v_version_data_storage_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_certifications" ADD CONSTRAINT "_services_v_version_certifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_source_urls" ADD CONSTRAINT "_services_v_version_source_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_keywords" ADD CONSTRAINT "_services_v_version_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_screenshot_id_media_id_fk" FOREIGN KEY ("version_screenshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_recommended_alternative_id_services_id_fk" FOREIGN KEY ("version_recommended_alternative_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_guides_v_version_missing_features_order_idx" ON "_guides_v_version_missing_features" USING btree ("_order");
  CREATE INDEX "_guides_v_version_missing_features_parent_id_idx" ON "_guides_v_version_missing_features" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_missing_features_locale_idx" ON "_guides_v_version_missing_features" USING btree ("_locale");
  CREATE INDEX "_guides_v_version_steps_order_idx" ON "_guides_v_version_steps" USING btree ("_order");
  CREATE INDEX "_guides_v_version_steps_parent_id_idx" ON "_guides_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_steps_locale_idx" ON "_guides_v_version_steps" USING btree ("_locale");
  CREATE INDEX "_guides_v_version_keywords_order_idx" ON "_guides_v_version_keywords" USING btree ("_order");
  CREATE INDEX "_guides_v_version_keywords_parent_id_idx" ON "_guides_v_version_keywords" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_keywords_locale_idx" ON "_guides_v_version_keywords" USING btree ("_locale");
  CREATE INDEX "_guides_v_parent_idx" ON "_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_slug_idx" ON "_guides_v" USING btree ("version_slug");
  CREATE INDEX "_guides_v_version_version_category_idx" ON "_guides_v" USING btree ("version_category_id");
  CREATE INDEX "_guides_v_version_version_source_service_idx" ON "_guides_v" USING btree ("version_source_service_id");
  CREATE INDEX "_guides_v_version_version_target_service_idx" ON "_guides_v" USING btree ("version_target_service_id");
  CREATE INDEX "_guides_v_version_version_og_image_idx" ON "_guides_v" USING btree ("version_og_image_id");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_snapshot_idx" ON "_guides_v" USING btree ("snapshot");
  CREATE INDEX "_guides_v_published_locale_idx" ON "_guides_v" USING btree ("published_locale");
  CREATE INDEX "_guides_v_latest_idx" ON "_guides_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_guides_v_locales_locale_parent_id_unique" ON "_guides_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_landing_pages_v_version_keywords_order_idx" ON "_landing_pages_v_version_keywords" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_version_keywords_parent_id_idx" ON "_landing_pages_v_version_keywords" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_parent_idx" ON "_landing_pages_v" USING btree ("parent_id");
  CREATE INDEX "_landing_pages_v_version_version_slug_idx" ON "_landing_pages_v" USING btree ("version_slug");
  CREATE INDEX "_landing_pages_v_version_version_category_idx" ON "_landing_pages_v" USING btree ("version_category_id");
  CREATE INDEX "_landing_pages_v_version_version_related_service_idx" ON "_landing_pages_v" USING btree ("version_related_service_id");
  CREATE INDEX "_landing_pages_v_version_version_og_image_idx" ON "_landing_pages_v" USING btree ("version_og_image_id");
  CREATE INDEX "_landing_pages_v_version_version_updated_at_idx" ON "_landing_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_landing_pages_v_version_version_created_at_idx" ON "_landing_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_landing_pages_v_version_version__status_idx" ON "_landing_pages_v" USING btree ("version__status");
  CREATE INDEX "_landing_pages_v_created_at_idx" ON "_landing_pages_v" USING btree ("created_at");
  CREATE INDEX "_landing_pages_v_updated_at_idx" ON "_landing_pages_v" USING btree ("updated_at");
  CREATE INDEX "_landing_pages_v_snapshot_idx" ON "_landing_pages_v" USING btree ("snapshot");
  CREATE INDEX "_landing_pages_v_published_locale_idx" ON "_landing_pages_v" USING btree ("published_locale");
  CREATE INDEX "_landing_pages_v_latest_idx" ON "_landing_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_landing_pages_v_locales_locale_parent_id_unique" ON "_landing_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_landing_pages_v_rels_order_idx" ON "_landing_pages_v_rels" USING btree ("order");
  CREATE INDEX "_landing_pages_v_rels_parent_idx" ON "_landing_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_landing_pages_v_rels_path_idx" ON "_landing_pages_v_rels" USING btree ("path");
  CREATE INDEX "_landing_pages_v_rels_services_id_idx" ON "_landing_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_version_keywords_order_idx" ON "_pages_v_version_keywords" USING btree ("_order");
  CREATE INDEX "_pages_v_version_keywords_parent_id_idx" ON "_pages_v_version_keywords" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_keywords_locale_idx" ON "_pages_v_version_keywords" USING btree ("_locale");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_og_image_idx" ON "_pages_v" USING btree ("version_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_version_features_order_idx" ON "_services_v_version_features" USING btree ("_order");
  CREATE INDEX "_services_v_version_features_parent_id_idx" ON "_services_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_features_locale_idx" ON "_services_v_version_features" USING btree ("_locale");
  CREATE INDEX "_services_v_version_tags_order_idx" ON "_services_v_version_tags" USING btree ("_order");
  CREATE INDEX "_services_v_version_tags_parent_id_idx" ON "_services_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_issues_order_idx" ON "_services_v_version_issues" USING btree ("_order");
  CREATE INDEX "_services_v_version_issues_parent_id_idx" ON "_services_v_version_issues" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_issues_locale_idx" ON "_services_v_version_issues" USING btree ("_locale");
  CREATE INDEX "_services_v_version_data_storage_locations_order_idx" ON "_services_v_version_data_storage_locations" USING btree ("_order");
  CREATE INDEX "_services_v_version_data_storage_locations_parent_id_idx" ON "_services_v_version_data_storage_locations" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_certifications_order_idx" ON "_services_v_version_certifications" USING btree ("_order");
  CREATE INDEX "_services_v_version_certifications_parent_id_idx" ON "_services_v_version_certifications" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_source_urls_order_idx" ON "_services_v_version_source_urls" USING btree ("_order");
  CREATE INDEX "_services_v_version_source_urls_parent_id_idx" ON "_services_v_version_source_urls" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_keywords_order_idx" ON "_services_v_version_keywords" USING btree ("_order");
  CREATE INDEX "_services_v_version_keywords_parent_id_idx" ON "_services_v_version_keywords" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_keywords_locale_idx" ON "_services_v_version_keywords" USING btree ("_locale");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_category_idx" ON "_services_v" USING btree ("version_category_id");
  CREATE INDEX "_services_v_version_version_screenshot_idx" ON "_services_v" USING btree ("version_screenshot_id");
  CREATE INDEX "_services_v_version_version_logo_idx" ON "_services_v" USING btree ("version_logo_id");
  CREATE INDEX "_services_v_version_version_recommended_alternative_idx" ON "_services_v" USING btree ("version_recommended_alternative_id");
  CREATE INDEX "_services_v_version_version_og_image_idx" ON "_services_v" USING btree ("version_og_image_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "guides__status_idx" ON "guides" USING btree ("_status");
  CREATE INDEX "landing_pages__status_idx" ON "landing_pages" USING btree ("_status");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_guides_v_version_missing_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_version_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_pages_v_version_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_issues" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_data_storage_locations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_certifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_source_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_guides_v_version_missing_features" CASCADE;
  DROP TABLE "_guides_v_version_steps" CASCADE;
  DROP TABLE "_guides_v_version_keywords" CASCADE;
  DROP TABLE "_guides_v" CASCADE;
  DROP TABLE "_guides_v_locales" CASCADE;
  DROP TABLE "_landing_pages_v_version_keywords" CASCADE;
  DROP TABLE "_landing_pages_v" CASCADE;
  DROP TABLE "_landing_pages_v_locales" CASCADE;
  DROP TABLE "_landing_pages_v_rels" CASCADE;
  DROP TABLE "_pages_v_version_keywords" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_services_v_version_features" CASCADE;
  DROP TABLE "_services_v_version_tags" CASCADE;
  DROP TABLE "_services_v_version_issues" CASCADE;
  DROP TABLE "_services_v_version_data_storage_locations" CASCADE;
  DROP TABLE "_services_v_version_certifications" CASCADE;
  DROP TABLE "_services_v_version_source_urls" CASCADE;
  DROP TABLE "_services_v_version_keywords" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP INDEX "guides__status_idx";
  DROP INDEX "landing_pages__status_idx";
  DROP INDEX "pages__status_idx";
  DROP INDEX "services__status_idx";
  ALTER TABLE "guides_missing_features" ALTER COLUMN "feature" SET NOT NULL;
  ALTER TABLE "guides_steps" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "guides_steps" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "guides_keywords" ALTER COLUMN "keyword" SET NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "difficulty" SET NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "time_required" SET NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "category_id" SET NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "source_service_id" SET NOT NULL;
  ALTER TABLE "guides" ALTER COLUMN "target_service_id" SET NOT NULL;
  ALTER TABLE "guides_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "guides_locales" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "landing_pages_keywords" ALTER COLUMN "keyword" SET NOT NULL;
  ALTER TABLE "landing_pages" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "landing_pages_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "landing_pages_locales" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "pages_keywords" ALTER COLUMN "keyword" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "pages_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_locales" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "services_features" ALTER COLUMN "feature" SET NOT NULL;
  ALTER TABLE "services_tags" ALTER COLUMN "tag" SET NOT NULL;
  ALTER TABLE "services_data_storage_locations" ALTER COLUMN "location" SET NOT NULL;
  ALTER TABLE "services_certifications" ALTER COLUMN "certification" SET NOT NULL;
  ALTER TABLE "services_source_urls" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "services_keywords" ALTER COLUMN "keyword" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "region" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "category_id" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "location" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "guides" DROP COLUMN "_status";
  ALTER TABLE "landing_pages" DROP COLUMN "_status";
  ALTER TABLE "pages" DROP COLUMN "_status";
  ALTER TABLE "services" DROP COLUMN "_status";
  DROP TYPE "public"."enum_guides_status";
  DROP TYPE "public"."enum__guides_v_version_steps_video_orientation";
  DROP TYPE "public"."enum__guides_v_version_difficulty";
  DROP TYPE "public"."enum__guides_v_version_status";
  DROP TYPE "public"."enum__guides_v_published_locale";
  DROP TYPE "public"."enum_landing_pages_status";
  DROP TYPE "public"."enum__landing_pages_v_version_status";
  DROP TYPE "public"."enum__landing_pages_v_published_locale";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_region";
  DROP TYPE "public"."enum__services_v_version_research_status";
  DROP TYPE "public"."enum__services_v_version_gdpr_compliance";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";`)
}
