import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantModule } from './tenant/tenant.module';
import { RbacModule } from './rbac/rbac.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TenantModule,
    RbacModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
