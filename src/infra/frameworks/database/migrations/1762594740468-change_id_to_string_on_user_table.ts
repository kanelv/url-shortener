import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeIdToStringOnUserTable1762594740468
  implements MigrationInterface
{
  name = 'ChangeIdToStringOnUserTable1762594740468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop url table and its constraints (migrating to DynamoDB)
    await queryRunner.query(
      `ALTER TABLE "url" DROP CONSTRAINT "FK_5a6f06cf39e1d19c00f7524c4e8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4d015c4b891325776b8c882a9a"`
    );
    await queryRunner.query(`DROP TABLE "url"`);

    // Change user.id from SERIAL to UUID
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert user.id from UUID back to SERIAL
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`
    );

    // Recreate url table (reverse the drop operation)
    await queryRunner.query(
      `CREATE TABLE "url" ("id" SERIAL NOT NULL, "url_code" character varying NOT NULL, "original_url" character varying NOT NULL, "clicks" integer NOT NULL DEFAULT '0',
        "status" boolean NOT NULL DEFAULT true, "expired_at" TIMESTAMP NOT NULL, "user_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT
        "PK_7421088122ee64b55556dfc3a91" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4d015c4b891325776b8c882a9a" ON "url" ("url_code") `
    );
    await queryRunner.query(
      `ALTER TABLE "url" ADD CONSTRAINT "FK_5a6f06cf39e1d19c00f7524c4e8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
