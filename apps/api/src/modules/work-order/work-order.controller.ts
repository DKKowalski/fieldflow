import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { WorkOrderService } from './work-order.service.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto.js';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll() {
    return this.workOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateWorkOrderDto) {
    return this.workOrderService.create(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateWorkOrderStatusDto,
  ) {
    return this.workOrderService.updateStatus(id, body.status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateWorkOrderDto) {
    return this.workOrderService.update(id, body);
  }
}
