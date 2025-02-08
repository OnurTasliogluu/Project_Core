import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
} from "@nestjs/common";

import { PermissionService } from "./permission.service";
import { Permission } from "../entity/permission.entity";

@Controller("permissions")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async findAll(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Post()
  async createPermission(
    @Body() permissionData: Partial<Permission>,
  ): Promise<Permission> {
    return this.permissionService.createPermission(permissionData);
  }
}
