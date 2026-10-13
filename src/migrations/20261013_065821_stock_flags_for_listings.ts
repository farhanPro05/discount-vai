import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "in_stock" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "version_in_stock" boolean;
  CREATE INDEX "products_in_stock_idx" ON "products" USING btree ("in_stock");
  CREATE INDEX "_products_v_version_version_in_stock_idx" ON "_products_v" USING btree ("version_in_stock");`)

  // Fill in the new stock helpers for products saved before this change (new saves compute them).
  await db.execute(sql`
   UPDATE "products" SET "in_stock" = COALESCE("total_stock", 0) > 0;
  UPDATE "_products_v" SET "version_in_stock" = COALESCE("version_total_stock", 0) > 0;
  DELETE FROM "products_texts" WHERE "path" IN ('availableColours', 'variants');
  INSERT INTO "products_texts" ("order", "parent_id", "path", "text")
    SELECT row_number() OVER (PARTITION BY c."_parent_id" ORDER BY c."_order"), c."_parent_id", 'availableColours', c."name"
    FROM "products_colours" c
    WHERE EXISTS (SELECT 1 FROM "products_colours_sizes" s WHERE s."_parent_id" = c."id" AND s."stock" > 0);
  INSERT INTO "products_texts" ("order", "parent_id", "path", "text")
    SELECT row_number() OVER (PARTITION BY c."_parent_id" ORDER BY c."_order", s."_order"), c."_parent_id", 'variants', c."name" || '|' || s."size"
    FROM "products_colours" c JOIN "products_colours_sizes" s ON s."_parent_id" = c."id"
    WHERE s."stock" > 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DELETE FROM "products_texts" WHERE "path" IN ('availableColours', 'variants');`)
  await db.execute(sql`
   DROP INDEX "products_in_stock_idx";
  DROP INDEX "_products_v_version_version_in_stock_idx";
  ALTER TABLE "products" DROP COLUMN "in_stock";
  ALTER TABLE "_products_v" DROP COLUMN "version_in_stock";`)
}
