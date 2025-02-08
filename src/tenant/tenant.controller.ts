import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './dto/tenant.dto';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantService.create(createTenantDto);
  }

  @Get(':subdomain')
  async findBySubdomain(
    @Param('subdomain') subdomain: string,
  ): Promise<Tenant> {
    const tenant = await this.tenantService.findBySubdomain(subdomain);
    if (!tenant) {
      throw new NotFoundException(
        `Tenant with subdomain "${subdomain}" not found`,
      );
    }
    return tenant;
  }

  @Get()
  async findAll(): Promise<Tenant[]> {
    return this.tenantService.findAll();
  }

  @Put(':subdomain')
  async update(
    @Param('subdomain') subdomain: string,
    @Body() updateData: Partial<Tenant>,
  ): Promise<Tenant> {
    return this.tenantService.update(subdomain, updateData);
  }

  @Delete(':subdomain')
  async delete(@Param('subdomain') subdomain: string): Promise<Tenant> {
    return this.tenantService.delete(subdomain);
  }
}