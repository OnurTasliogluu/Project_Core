import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Prisma } from "@prisma/client";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() data: Prisma.UserCreateInput) {
    return this.userService.createUser(data);
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get(":id")
  async getUserById(@Param("id") id: string) {
    return this.userService.findUserById(id);
  }

  @Put(":id")
  async updateUser(
    @Param("id") id: string,
    @Body() data: Prisma.UserUpdateInput,
  ) {
    return this.userService.updateUser(id, data);
  }

  @Delete(":id")
  async deleteUser(@Param("id") id: string) {
    return this.userService.deleteUser(id);
  }
}
