import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "commerce" ADD COLUMN "last_order_number" numeric;`)
  // Start the mark at the highest order number already used.
  await db.execute(sql`
   UPDATE "commerce" SET "last_order_number" = (
     SELECT MAX(NULLIF(regexp_replace("order_number", '\\D', '', 'g'), '')::numeric) FROM "orders"
   );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "commerce" DROP COLUMN "last_order_number";`)
}
