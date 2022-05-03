import { Migration } from "medusa-extender"
import { MigrationInterface, QueryRunner } from "typeorm"

@Migration()
export class productVariant1651213555842 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_variant_location" ("product_variant_id" character varying NOT NULL, "location_id" character varying NOT NULL, CONSTRAINT "PK_product_variant_location" PRIMARY KEY ("product_variant_id", "location_id"))`
    )

    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_location_product_variant_id" ON "product_variant_location" ("product_variant_id")`
    )

    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_location_location_id" ON "product_variant_location" ("location_id")`
    )

    await queryRunner.query(
      `ALTER TABLE "product_variant_location" ADD CONSTRAINT "FK_product_variant_location_product_variant_id" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )

    await queryRunner.query(
      `ALTER TABLE "product_variant_location" ADD CONSTRAINT "FK_product_variant_location_location_id" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variant_location" DROP CONSTRAINT "FK_product_variant_location_product_variant_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "product_variant_location" DROP CONSTRAINT "FK_product_variant_location_location_id"`
    )
    await queryRunner.query(
      `DROP INDEX "IDX_product_variant_location_product_variant_id"`
    )
    await queryRunner.query(
      `DROP INDEX "IDX_product_variant_location_location_id"`
    )
    await queryRunner.query(`DROP TABLE "product_variant_location"`)
  }
}
