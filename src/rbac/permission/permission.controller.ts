import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from "@nestjs/common";

import { PermissionService } from "./permission.service";
import { Prisma, Permission } from "@prisma/client";

@Controller("permissions")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async createPermission(
    @Body() data: Prisma.PermissionCreateInput,
  ): Promise<Permission> {
    return this.permissionService.createPermission(data);
  }

  @Get()
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Get(":id")
  async getPermissionById(@Param("id") id: string): Promise<Permission | null> {
    return this.permissionService.findPermissionById(id);
  }

  @Put(":id")
  async updatePermission(
    @Param("id") id: string,
    @Body() data: Prisma.PermissionUpdateInput,
  ): Promise<Permission | null> {
    return this.permissionService.updatePermission(id, data);
  }

  @Delete(":id")
  async deletePermission(@Param("id") id: string): Promise<Permission | null> {
    return this.permissionService.deletePermission(id);
  }
}
