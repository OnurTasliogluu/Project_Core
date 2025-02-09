import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
} from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { Prisma, Tenant } from "@prisma/client";
@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async createTenant(@Body() data: Prisma.TenantCreateInput): Promise<Tenant> {
    return this.tenantService.createTenant(data);
  }

  @Get()
  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantService.findAllTenants();
  }

  @Get(":id")
  async getTenantById(@Param("id") id: string): Promise<Tenant | null> {
    return this.tenantService.findTenantById(id);
  }

  @Delete(":id")
  async deleteTenant(@Param("id") id: string): Promise<Tenant> {
    return this.tenantService.deleteTenant(id);
  }
}
