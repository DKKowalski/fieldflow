import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { SecurityModule } from '../auth/security.module.js';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
