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
import { Role } from "../entity/role.entity";

@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Post()
  async createRole(@Body() roleData: Partial<Role>): Promise<Role> {
    return this.roleService.createRole(roleData);
  }
}
