import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [UserModule, RoleModule, PermissionModule],
  exports: [UserModule, RoleModule, PermissionModule],
})
export class RbacModule {}
