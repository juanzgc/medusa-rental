import { Migration } from "medusa-extender"
import { MigrationInterface, QueryRunner } from "typeorm"

@Migration()
export class location1651213494792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "location" ("id" character varying NOT NULL, "city" character varying NOT NULL, "city_slug" character varying NOT NULL, "country" character varying NOT NULL, "thumbnail" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, CONSTRAINT "PK_location" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_location_city_slug" ON "location" ("city_slug") WHERE deleted_at IS NULL`
    )

    await queryRunner.query(
      `CREATE TABLE "location_image" ("location_id" character varying NOT NULL, "image_id" character varying NOT NULL, CONSTRAINT "PK_location_image" PRIMARY KEY ("location_id", "image_id"))`
    )

    await queryRunner.query(
      `CREATE INDEX "IDX_location_image_location_id" ON "location_image" ("location_id")`
    )

    await queryRunner.query(
      `CREATE INDEX "IDX_location_image_image_id" ON "location_image" ("image_id")`
    )

    await queryRunner.query(
      `ALTER TABLE "location_image" ADD CONSTRAINT "FK_location_image_location_id" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )

    await queryRunner.query(
      `ALTER TABLE "location_image" ADD CONSTRAINT "FK_location_image_image_id" FOREIGN KEY ("image_id") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "location_image" DROP CONSTRAINT "FK_location_image_location_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "location_image" DROP CONSTRAINT "FK_location_image_image_id"`
    )
    await queryRunner.query(`DROP INDEX "IDX_location_image_location_id"`)
    await queryRunner.query(`DROP INDEX "IDX_location_image_image_id"`)
    await queryRunner.query(`DROP INDEX "IDX_location_city_slug"`)
    await queryRunner.query(`DROP TABLE "location"`)
    await queryRunner.query(`DROP TABLE "location_image"`)
  }
}
