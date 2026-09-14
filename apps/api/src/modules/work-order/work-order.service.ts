import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkOrderStatus } from './work-order.types.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { type UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';
import { UserService } from '../user/user.service.js';
import type { AccessTokenPayload } from '../auth/auth.types.js';

const ALLOWED_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.OPEN]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.IN_PROGRESS]: [
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.COMPLETED]: [],
  [WorkOrderStatus.CANCELLED]: [],
};

@Injectable()
export class WorkOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async findAll(user: AccessTokenPayload) {
    if (user.role === 'dispatcher') {
      return await this.prisma.client.orm.public.WorkOrder.all();
    }

    return await this.prisma.client.orm.public.WorkOrder.where({
      assignedTechnicianId: user.sub,
    }).all();
  }

  async findOne(id: string, user: AccessTokenPayload) {
    const workOrder = await this.prisma.client.orm.public.WorkOrder.first({
      id,
      ...(user.role === 'technician' ? { assignedTechnicianId: user.sub } : {}),
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

  async updateStatus(
    id: string,
    status: WorkOrderStatus,
    user: AccessTokenPayload,
  ) {
    const existingWorkOrder = await this.findOne(id, user);
    const currentStatus = existingWorkOrder.status as WorkOrderStatus;

    if (user.role === 'technician' && status === WorkOrderStatus.CANCELLED) {
      throw new ForbiddenException('Technicians cannot cancel work orders');
    }

    if (currentStatus === status) {
      return existingWorkOrder;
    }

    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus];

    if (!allowedNextStatuses.includes(status)) {
      throw new ConflictException(
        `Cannot change work-order status from ${currentStatus} to ${status}`,
      );
    }

    const workOrder = await this.prisma.client.orm.public.WorkOrder.where({
      id,
      ...(user.role === 'technician' ? { assignedTechnicianId: user.sub } : {}),
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

  async assign(id: string, technicianId: string) {
    const technician = await this.userService.findOne(technicianId);

    if (technician.role !== 'technician') {
      throw new BadRequestException(
        'Work orders can only be assigned to technicians',
      );
    }

    const workOrder = await this.prisma.client.orm.public.WorkOrder.where({
      id,
    }).update({
      assignedTechnicianId: technicianId,
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }
}
