import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, User } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
