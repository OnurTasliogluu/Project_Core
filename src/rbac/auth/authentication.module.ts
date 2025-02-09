import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UserModule } from "../user/user.module";
import { HelperModule } from "../helper/helper.module";

@Module({
  imports: [
    JwtModule.register({
      secret: "your-secret-key", // Replace with your secret key
      signOptions: { expiresIn: "1h" }, // Token expiration time
    }),
    UserModule,
    HelperModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthenticationController],
  exports: [AuthService],
})
export class AuthenticationModule {}
