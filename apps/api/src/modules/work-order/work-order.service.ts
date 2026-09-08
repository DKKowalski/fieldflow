import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkOrderStatus } from './work-order.types.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { type UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const workOrders = await this.prisma.client.orm.public.WorkOrder.all();
    return workOrders;
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.client.orm.public.WorkOrder.first({
      id,
    });
    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }
    return workOrder;
  }

  async create(body: CreateWorkOrderDto) {
    const workOrder = await this.prisma.client.orm.public.WorkOrder.create({
      title: body.title as Varchar<120>,
      customerName: body.customerName as Varchar<120>,
    });
    return workOrder;
  }

  async updateStatus(id: string, status: WorkOrderStatus) {
    const workOrder = await this.prisma.client.orm.public.WorkOrder.where({
      id,
    }).update({
      status,
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }

  async update(id: string, body: UpdateWorkOrderDto) {
    const data = {
      ...(body.title !== undefined
        ? { title: body.title as Varchar<120> }
        : {}),
      ...(body.customerName !== undefined
        ? { customerName: body.customerName as Varchar<120> }
        : {}),
    };

    const workOrder = await this.prisma.client.orm.public.WorkOrder.where({
      id,
    }).update(data);

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }
}
