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
import type {
  TimestamptzString,
  Varchar,
} from '@prisma/orm-postgres/target/codec-types';
import { UserService } from '../user/user.service.js';
import type { AccessTokenPayload } from '../auth/auth.types.js';
import { ServiceLocationService } from '../service-location/service-location.service.js';
import { ScheduleWorkOrderDto } from './dto/schedule-work-order.dto.js';

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
    private readonly serviceLocationService: ServiceLocationService,
  ) {}

  async findAll(user: AccessTokenPayload, status?: WorkOrderStatus) {
    const query = this.prisma.client.orm.public.WorkOrder.include(
      'serviceLocation',
      (serviceLocation) =>
        serviceLocation.include('customer', (customer) =>
          customer.select('id', 'name', 'phone', 'email'),
        ),
    );

    if (user.role === 'dispatcher' && status === undefined) {
      return await query.all();
    }

    return await query
      .where({
        ...(user.role === 'technician'
          ? { assignedTechnicianId: user.sub }
          : {}),
        ...(status !== undefined ? { status } : {}),
      })
      .all();
  }

  async findOne(id: string, user: AccessTokenPayload) {
    const workOrder = await this.prisma.client.orm.public.WorkOrder.include(
      'serviceLocation',
      (serviceLocation) =>
        serviceLocation.include('customer', (customer) =>
          customer.select('id', 'name', 'phone', 'email'),
        ),
    ).first({
      id,
      ...(user.role === 'technician' ? { assignedTechnicianId: user.sub } : {}),
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }
    return workOrder;
  }

  async create(body: CreateWorkOrderDto) {
    const serviceLocation = await this.serviceLocationService.findOne(
      body.serviceLocationId,
    );

    return await this.prisma.client.orm.public.WorkOrder.create({
      title: body.title.trim() as Varchar<120>,
      serviceLocationId: serviceLocation.id,
      description: body.description.trim() as Varchar<2000>,
    });
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
    const serviceLocation =
      body.serviceLocationId !== undefined
        ? await this.serviceLocationService.findOne(body.serviceLocationId)
        : undefined;

    const data = {
      ...(body.title !== undefined
        ? { title: body.title.trim() as Varchar<120> }
        : {}),
      ...(serviceLocation !== undefined
        ? {
            serviceLocationId: serviceLocation.id,
          }
        : {}),

      ...(body.description !== undefined
        ? {
            description: body.description.trim() as Varchar<2000>,
          }
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

  async schedule(id: string, body: ScheduleWorkOrderDto) {
    const startTime = Date.parse(body.scheduledStartAt);
    const endTime = Date.parse(body.scheduledEndAt);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'Scheduled end time must be later than scheduled start time',
      );
    }

    const workOrder = await this.prisma.client.orm.public.WorkOrder.where({
      id,
    }).update({
      scheduledStartAt: body.scheduledStartAt as TimestamptzString,
      scheduledEndAt: body.scheduledEndAt as TimestamptzString,
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }
}
