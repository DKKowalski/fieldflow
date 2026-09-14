import { Module } from '@nestjs/common';
import { WorkOrderController } from './work-order.controller.js';
import { WorkOrderService } from './work-order.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
})
export class WorkOrderModule {}
