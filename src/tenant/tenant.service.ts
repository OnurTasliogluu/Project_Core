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
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private prisma: PrismaService) {}

  async createTenant(data: Prisma.TenantCreateInput): Promise<Tenant> {
    try {
      // Check if tenant with the same subdomain or contactEmail already exists
      const existingTenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [
            { subdomain: data.subdomain },
            { contactEmail: data.contactEmail },
          ],
          isDeleted: false,
        },
      });

      if (existingTenant) {
        const isDuplicateSubdomain =
          existingTenant.subdomain === data.subdomain;
        const field = isDuplicateSubdomain ? "subdomain" : "contact email";
        throw new ConflictException(`Tenant with this ${field} already exists`);
      }

      // Create tenant with nested config and customFields
      const tenant = await this.prisma.tenant.create({
        data: {
          ...data,
          status: "ACTIVE",
          config: data.config && {
            create: {
              modules: data.config.create?.modules || [],
              customFields: data.config.create?.customFields && {
                create: {
                  industry:
                    data.config.create.customFields.create?.industry || "",
                  size: data.config.create.customFields.create?.size || "",
                },
              },
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
      if (error instanceof Error) {
        this.logger.error(`Error creating tenant: ${error.message}`, error.stack);
      } else {
        this.logger.error('Error creating tenant: Unknown error');
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Tenant with this subdomain or contact email already exists",
          );
        }
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to create tenant");
    }
  }

  async findAllTenants(): Promise<Tenant[]> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          config: {
            include: {
              customFields: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      this.logger.log(`Retrieved ${tenants.length} tenants`);
      return tenants;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error retrieving tenants: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error retrieving tenants: Unknown error');
      }
      throw new InternalServerErrorException("Failed to retrieve tenants");
    }
  }

  async findTenantById(id: string): Promise<Tenant> {
    try {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          id,
          isDeleted: false,
        },
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
      if (error instanceof Error) {
        this.logger.error(
          `Error retrieving tenant: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error retrieving tenant: Unknown error');
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to retrieve tenant");
    }
  }

  async updateTenant(
    id: string,
    data: Prisma.TenantUpdateInput,
  ): Promise<Tenant> {
    try {
      // Check if tenant exists and is not deleted
      const existingTenant = await this.findTenantById(id);

      // If updating subdomain or email, check for uniqueness
      if (data.subdomain || data.contactEmail) {
        const duplicateTenant = await this.prisma.tenant.findFirst({
          where: {
            id: { not: id },
            isDeleted: false,
            OR: [
              data.subdomain ? { subdomain: data.subdomain as string } : {},
              data.contactEmail
                ? { contactEmail: data.contactEmail as string }
                : {},
            ],
          },
        });

        if (duplicateTenant) {
          const field =
            duplicateTenant.subdomain === (data.subdomain as string)
              ? "subdomain"
              : "contact email";
          throw new ConflictException(
            `Tenant with this ${field} already exists`,
          );
        }
      }

      // Update tenant with nested updates
      const updatedTenant = await this.prisma.tenant.update({
        where: { id },
        data: {
          ...data,
          config: data.config && {
            upsert: {
              create: {
                modules: [],
                customFields: {
                  create: {
                    industry: "",
                    size: "",
                  },
                },
              },
              update: {
                modules: data.config.update?.modules,
                customFields: {
                  update: data.config.update?.customFields?.update,
                },
              },
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

      this.logger.log(`Tenant updated successfully: ${updatedTenant.id}`);
      return updatedTenant;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error updating tenant: ${error.message}`, error.stack);
      } else {
        this.logger.error('Error updating tenant: Unknown error');
      }
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "Tenant with this subdomain or contact email already exists",
        );
      }
      throw new InternalServerErrorException("Failed to update tenant");
    }
  }

  async deleteTenant(id: string): Promise<Tenant> {
    try {
      // Soft delete the tenant
      const deletedTenant = await this.prisma.tenant.update({
        where: { id },
        data: {
          isDeleted: true,
          status: "INACTIVE",
        },
        include: {
          config: {
            include: {
              customFields: true,
            },
          },
        },
      });

      this.logger.log(`Tenant soft-deleted successfully: ${deletedTenant.id}`);
      return deletedTenant;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error deleting tenant: ${error.message}`, error.stack);
      } else {
        this.logger.error('Error deleting tenant: Unknown error');
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to delete tenant");
    }
  }
}
