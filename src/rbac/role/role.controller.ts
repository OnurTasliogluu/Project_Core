import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from "@nestjs/common";

import { RoleService } from "./role.service";
import { Prisma } from "@prisma/client";

@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() data: Prisma.RoleCreateInput) {
    return this.roleService.createRole(data);
  }

  @Get()
  async getAllRoles() {
    return this.roleService.findAll();
  }

  @Get(":id")
  async getRoleById(@Param("id") id: string) {
    return this.roleService.findRoleById(id);
  }

  @Put(":id")
  async updateRole(
    @Param("id") id: string,
    @Body() data: Prisma.RoleUpdateInput,
  ) {
    return this.roleService.updateRole(id, data);
  }

  @Delete(":id")
  async deleteRole(@Param("id") id: string) {
    return this.roleService.deleteRole(id);
  }
}
