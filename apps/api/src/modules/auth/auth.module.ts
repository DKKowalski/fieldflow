import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserModule } from '../user/user.module.js';
import { SecurityModule } from './security.module.js';

@Module({
  imports: [UserModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [SecurityModule],
})
export class AuthModule {}
