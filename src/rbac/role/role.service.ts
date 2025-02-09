

import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
import { Prisma, Role } from "@prisma/client";
import { validate } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(roleData: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({ data: roleData });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findRoleById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async updateRole(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }

  async deleteRole(id: string): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }
}
