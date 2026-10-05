import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "commerce" ADD COLUMN "next_steps_call" varchar DEFAULT 'Within 2 hours, between 9 am and 10 pm.';
  ALTER TABLE "commerce" ADD COLUMN "next_steps_ship" varchar DEFAULT 'Same or next day. The courier contacts you before delivering.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "commerce" DROP COLUMN "next_steps_call";
  ALTER TABLE "commerce" DROP COLUMN "next_steps_ship";`)
}
