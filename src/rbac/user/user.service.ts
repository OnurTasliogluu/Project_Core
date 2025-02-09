import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { PasswordService } from "src/rbac/helper/password.service";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      // Check if user with the same email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }

      data.password = await this.passwordService.hashPassword(data.password);

      const user = await this.prisma.user.create({ data });
      this.logger.log(`Created new user with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findUserById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      // Check if user exists and is not deleted
      await this.findUserById(id);

      // If updating email, check for duplicates
      if (data.email) {
        const existingUser = await this.prisma.user.findFirst({
          where: {
            email: data.email as string,
            id: { not: id },
            isDeleted: false,
          },
        });

        if (existingUser) {
          throw new ConflictException("Email already in use by another user");
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
      });

      this.logger.log(`Updated user with ID: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update user ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      // Check if user exists
      await this.findUserById(id);

      // Soft delete the user
      const deletedUser = await this.prisma.user.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Soft deleted user with ID: ${id}`);
      return deletedUser;
    } catch (error) {
      this.logger.error(
        `Failed to delete user ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
