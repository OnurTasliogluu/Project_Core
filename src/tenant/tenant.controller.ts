import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
  HttpStatus,
  HttpCode,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { Prisma, Tenant } from "@prisma/client";

@Controller("tenants")
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Body() data: Prisma.TenantCreateInput): Promise<Tenant> {
    try {
      const tenant = await this.tenantService.createTenant(data);
      this.logger.log(`Created tenant with ID: ${tenant.id}`);
      return tenant;
    } catch (error) {
      this.logger.error(
        `Failed to create tenant: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTenants(): Promise<Tenant[]> {
    try {
      const tenants = await this.tenantService.findAllTenants();
      this.logger.log(`Retrieved ${tenants.length} tenants`);
      return tenants;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve tenants: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async getTenantById(@Param("id") id: string): Promise<Tenant> {
    try {
      const tenant = await this.tenantService.findTenantById(id);
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }
      this.logger.log(`Retrieved tenant with ID: ${tenant.id}`);
      return tenant;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve tenant ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to retrieve tenant with ID ${id}`,
      );
    }
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async updateTenant(
    @Param("id") id: string,
    @Body() data: Prisma.TenantUpdateInput,
  ): Promise<Tenant> {
    try {
      const tenant = await this.tenantService.findTenantById(id);
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }
      const updatedTenant = await this.tenantService.updateTenant(id, data);
      this.logger.log(`Updated tenant with ID: ${updatedTenant.id}`);
      return updatedTenant;
    } catch (error) {
      this.logger.error(
        `Failed to update tenant ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async deleteTenant(@Param("id") id: string): Promise<Tenant> {
    try {
      const tenant = await this.tenantService.findTenantById(id);
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }
      const deletedTenant = await this.tenantService.deleteTenant(id);
      this.logger.log(`Deleted tenant with ID: ${deletedTenant.id}`);
      return deletedTenant;
    } catch (error) {
      this.logger.error(
        `Failed to delete tenant ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}
