import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" ADD COLUMN "google_analytics_id" varchar;
  ALTER TABLE "site" ADD COLUMN "google_verification" varchar;
  ALTER TABLE "site" ADD COLUMN "meta_pixel_id" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" DROP COLUMN "google_analytics_id";
  ALTER TABLE "site" DROP COLUMN "google_verification";
  ALTER TABLE "site" DROP COLUMN "meta_pixel_id";`)
}
