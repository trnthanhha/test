import { MigrationInterface, QueryRunner } from 'typeorm';

export class collateLocationName1662970120918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(
      'ALTER TABLE location ALTER name SET DATA TYPE varchar COLLATE ignore_accent;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return Promise.resolve(undefined);
  }
}
