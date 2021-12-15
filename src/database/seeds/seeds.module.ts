import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { PermissionModule } from 'src/modules/permission/permission.module';

import { PermissionSeed } from 'src/database/seeds/permission.seed';
import { RoleSeed } from './role.seed';
import { RoleModule } from 'src/modules/role/role.module';
import { UserSeed } from './user.seed';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    imports: [CommandModule, PermissionModule, RoleModule, UserModule],
    providers: [PermissionSeed, RoleSeed, UserSeed],
    exports: []
})
export class SeedsModule {}
