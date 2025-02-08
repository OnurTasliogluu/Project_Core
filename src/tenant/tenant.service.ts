import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './dto/tenant.dto';
import { validate } from 'class-validator';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = new Tenant();
    Object.assign(tenant, createTenantDto);
  
    // Validate tenant data
    await this.validateTenant(tenant);
  
    // Ensure subdomain is unique
    await this.ensureUniqueSubdomain(tenant.subdomain);
  
    try {
      Logger.log(`Creating tenant: Name=${tenant.name}, Subdomain=${tenant.subdomain}`);
      const savedTenant = await this.tenantRepository.save(tenant);
  
      if (!savedTenant?._id) {
        Logger.warn(`Tenant creation returned unexpected result.`);
        return this.verifyTenantSave(tenant.subdomain);
      }
  
      Logger.log(`Successfully created tenant with ID: ${savedTenant._id}`);
      return savedTenant;
    } catch (error) {
      Logger.error(`Failed to save tenant: ${error.message}`);
      return this.verifyTenantSave(tenant.subdomain, error);
    }
  }
  
  /**
   * Validates the tenant entity.
   */
  private async validateTenant(tenant: Tenant): Promise<void> {
    const errors = await validate(tenant);
    if (errors.length > 0) {
      Logger.error(`Validation failed: ${JSON.stringify(errors)}`);
      throw new BadRequestException(errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
      })));
    }
  }
  
  /**
   * Ensures that the subdomain is unique.
   */
  private async ensureUniqueSubdomain(subdomain: string): Promise<void> {
    if (!subdomain) return;
  
    const count = await this.tenantRepository.count({ where: { subdomain } });
    if (count > 0) {
      throw new ConflictException(`Subdomain '${subdomain}' is already taken`);
    }
  }
  
  /**
   * Verifies if the tenant was actually saved.
   */
  private async verifyTenantSave(subdomain: string, error?: Error): Promise<Tenant> {
    const verifyTenant = await this.tenantRepository.findOne({ where: { subdomain } });
  
    if (verifyTenant) {
      Logger.warn(`Save reported an error, but tenant was created successfully: ID=${verifyTenant._id}`);
      return verifyTenant;
    }
  
    if (error) {
      Logger.error(`Error verifying tenant save: ${error.message}`);
    }
  
    throw new InternalServerErrorException('Failed to create tenant');
  }
  

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { subdomain } });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async update(subdomain: string, updateData: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findBySubdomain(subdomain);

    // Throw an error if the tenant is not found
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain "${subdomain}" not found`);
    }

    // Update the tenant with new data
    Object.assign(tenant, updateData);
    return this.tenantRepository.save(tenant);
  }

  async delete(subdomain: string): Promise<Tenant> {
    const tenant = await this.findBySubdomain(subdomain);

    // Throw an error if the tenant is not found
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain "${subdomain}" not found`);
    }

    // Soft delete the tenant
    tenant.isDeleted = true;
    return this.tenantRepository.save(tenant);
  }
}
