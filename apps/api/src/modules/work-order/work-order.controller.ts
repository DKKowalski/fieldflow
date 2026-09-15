import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { ScheduleWorkOrderDto } from './dto/schedule-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dto/list-work-orders-query.dto.js';

@UseGuards(AuthGuard, RolesGuard)
@Roles('dispatcher', 'technician')
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListWorkOrdersQueryDto,
  ) {
    return this.workOrderService.findAll(request.user, query.status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.workOrderService.findOne(id, request.user);
  }

  @Roles('dispatcher')
  @Post()
  create(@Body() body: CreateWorkOrderDto) {
    return this.workOrderService.create(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateWorkOrderStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workOrderService.updateStatus(id, body.status, request.user);
  }

  @Roles('dispatcher')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateWorkOrderDto) {
    return this.workOrderService.update(id, body);
  }

  @Roles('dispatcher')
  @Patch(':id/assignment')
  assign(@Param('id') id: string, @Body() body: AssignWorkOrderDto) {
    return this.workOrderService.assign(id, body.technicianId);
  }

  @Roles('dispatcher')
  @Patch(':id/schedule')
  schedule(@Param('id') id: string, @Body() body: ScheduleWorkOrderDto) {
    return this.workOrderService.schedule(id, body);
  }
}
