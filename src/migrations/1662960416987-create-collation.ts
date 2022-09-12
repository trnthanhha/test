import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCollation1662960416987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(
      "CREATE COLLATION ignore_accent (provider = icu, locale = 'und-u-ks-level1-kc-true', deterministic = false);",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return Promise.resolve(undefined);
  }
}
