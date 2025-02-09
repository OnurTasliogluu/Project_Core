import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { PasswordService } from "../helper/password.service";

interface JwtPayload {
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return false;
    }

    return await this.passwordService.comparePassword(password, user.password);
  }

  async login(user: {email: string, password: string}) {

    if (!await this.validateUser(user.email, user.password)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.password,
      iat: Math.floor(Date.now() / 1000),
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: "Bearer",
      expires_in: 3600,
      user: {
        id: user.password,
        email: user.email,
      },
    };
  }
}
