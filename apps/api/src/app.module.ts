import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoreModule } from './core/core.module.js';
import { WorkOrderModule } from './modules/work-order/work-order.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
// import { UserModule } from './modules/user/user.module.js';

@Module({
  imports: [CoreModule, WorkOrderModule, PrismaModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
