import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1693239849817 implements MigrationInterface {
    name = 'Init1693239849817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "user_name" character varying NOT NULL, "email" character varying, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d34106f8ec1ebaf66f4f8609dd" ON "user" ("user_name") `);
        await queryRunner.query(`CREATE TABLE "url" ("id" SERIAL NOT NULL, "url_code" character varying NOT NULL, "original_url" character varying NOT NULL, "clicks" integer NOT NULL DEFAULT '0', "status" boolean NOT NULL DEFAULT true, "expired_at" TIMESTAMP NOT NULL, "user_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7421088122ee64b55556dfc3a91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4d015c4b891325776b8c882a9a" ON "url" ("url_code") `);
        await queryRunner.query(`ALTER TABLE "url" ADD CONSTRAINT "FK_5a6f06cf39e1d19c00f7524c4e8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "url" DROP CONSTRAINT "FK_5a6f06cf39e1d19c00f7524c4e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d015c4b891325776b8c882a9a"`);
        await queryRunner.query(`DROP TABLE "url"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d34106f8ec1ebaf66f4f8609dd"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
