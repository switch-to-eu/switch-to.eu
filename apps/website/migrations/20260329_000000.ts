import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // guides_steps: change video from varchar to integer FK pointing to media
  await db.execute(sql`
    ALTER TABLE "guides_steps" DROP COLUMN IF EXISTS "video";
    ALTER TABLE "guides_steps" ADD COLUMN "video_id" integer;
    ALTER TABLE "guides_steps" ADD CONSTRAINT "guides_steps_video_id_media_id_fk"
      FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    CREATE INDEX IF NOT EXISTS "guides_steps_video_idx" ON "guides_steps" USING btree ("video_id");
  `)

  // _guides_v_version_steps (versioned table): same change
  await db.execute(sql`
    ALTER TABLE "_guides_v_version_steps" DROP COLUMN IF EXISTS "video";
    ALTER TABLE "_guides_v_version_steps" ADD COLUMN "video_id" integer;
    ALTER TABLE "_guides_v_version_steps" ADD CONSTRAINT "_guides_v_version_steps_video_id_media_id_fk"
      FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    CREATE INDEX IF NOT EXISTS "_guides_v_version_steps_video_idx" ON "_guides_v_version_steps" USING btree ("video_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert guides_steps
  await db.execute(sql`
    DROP INDEX IF EXISTS "guides_steps_video_idx";
    ALTER TABLE "guides_steps" DROP CONSTRAINT IF EXISTS "guides_steps_video_id_media_id_fk";
    ALTER TABLE "guides_steps" DROP COLUMN IF EXISTS "video_id";
    ALTER TABLE "guides_steps" ADD COLUMN "video" varchar;
  `)

  // Revert _guides_v_version_steps
  await db.execute(sql`
    DROP INDEX IF EXISTS "_guides_v_version_steps_video_idx";
    ALTER TABLE "_guides_v_version_steps" DROP CONSTRAINT IF EXISTS "_guides_v_version_steps_video_id_media_id_fk";
    ALTER TABLE "_guides_v_version_steps" DROP COLUMN IF EXISTS "video_id";
    ALTER TABLE "_guides_v_version_steps" ADD COLUMN "video" varchar;
  `)
}
