import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, Permission } from "@prisma/client";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async createPermission(
    permissionData: Prisma.PermissionCreateInput,
  ): Promise<Permission> {
    return this.prisma.permission.create({
      data: permissionData,
    });
  }

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async findPermissionById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async updatePermission(
    id: string,
    data: Prisma.PermissionUpdateInput,
  ): Promise<Permission> {
    return this.prisma.permission.update({ where: { id }, data });
  }

  async deletePermission(id: string): Promise<Permission> {
    return this.prisma.permission.delete({ where: { id } });
  }
}
