import { Module } from '@nestjs/common';
import { ServiceLocationService } from './service-location.service.js';
import { ServiceLocationController } from './service-location.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { CustomerModule } from '../customer/customer.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, CustomerModule, AuthModule],
  controllers: [ServiceLocationController],
  providers: [ServiceLocationService],
  exports: [ServiceLocationService],
})
export class ServiceLocationModule {}
