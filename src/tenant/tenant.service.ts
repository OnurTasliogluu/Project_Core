import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { Prisma, Tenant } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { validate } from "class-validator";

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private prisma: PrismaService) {}

  async createTenant(data: Prisma.TenantCreateInput): Promise<Tenant> {
    try {
      // Validate input data
      const errors = await validate(data);
      if (errors.length > 0) {
        throw new BadRequestException(
          "Validation failed",
          JSON.stringify(errors),
        );
      }

      // Check if tenant with the same subdomain or contactEmail already exists
      const existingTenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [
            { subdomain: data.subdomain },
            { contactEmail: data.contactEmail },
          ],
        },
      });

      if (existingTenant) {
        throw new ConflictException(
          "Tenant with the same subdomain or contact email already exists",
        );
      }

      // Create tenant with nested config and customFields
      const tenant = await this.prisma.tenant.create({
        data: {
          ...data,
          config: {
            create: {
              ...data.config?.create,
              customFields: data.config?.create?.customFields?.create
                ? { create: data.config.create.customFields.create }
                : undefined, // Avoid passing an empty object
            },
          },
        },
        include: {
          config: {
            include: {
              customFields: true,
            },
          },
        },
      });

      this.logger.log(`Tenant created successfully: ${tenant.id}`);
      return tenant;
    } catch (error) {
      this.logger.error(`Error creating tenant: ${error.message}`, error.stack);
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to create tenant");
    }
  }

  async findAllTenants(): Promise<Tenant[]> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        include: {
          config: {
            include: {
              customFields: true,
            },
          },
        },
      });
      this.logger.log(`Retrieved ${tenants.length} tenants`);
      return tenants;
    } catch (error) {
      this.logger.error(
        `Error retrieving tenants: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException("Failed to retrieve tenants");
    }
  }

  async findTenantById(id: string): Promise<Tenant | null> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id },
        include: {
          config: {
            include: {
              customFields: true,
            },
          },
        },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      this.logger.log(`Retrieved tenant by ID: ${tenant.id}`);
      return tenant;
    } catch (error) {
      this.logger.error(
        `Error retrieving tenant by ID: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to retrieve tenant");
    }
  }

  async deleteTenant(id: string): Promise<Tenant> {
    try {
      // Check if tenant exists
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { id },
      });
      if (!existingTenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      // Delete tenant
      const deletedTenant = await this.prisma.tenant.delete({ where: { id } });
      this.logger.log(`Tenant deleted successfully: ${deletedTenant.id}`);
      return deletedTenant;
    } catch (error) {
      this.logger.error(`Error deleting tenant: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to delete tenant");
    }
  }
}
