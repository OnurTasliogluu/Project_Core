import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AuthenticationModule } from './auth/authentication.module';
import { HelperModule } from './helper/helper.module';

@Module({
  imports: [UserModule, RoleModule, PermissionModule, AuthenticationModule, HelperModule],
  exports: [UserModule, RoleModule, PermissionModule, AuthenticationModule, HelperModule],
})
export class RbacModule {}
