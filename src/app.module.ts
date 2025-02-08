import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './tenant/tenant.module';
import { Tenant } from './tenant/tenant.entity';
import { RbacModule } from './rbac/rbac.module';
import { Permission } from './rbac/entity/permission.entity';
import { Role } from './rbac/entity/role.entity';
import { User } from './rbac/entity/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Tenant, User, Role, Permission],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TenantModule,
    RbacModule,
  ],
})
export class AppModule {}
