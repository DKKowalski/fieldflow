import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { WorkOrderService } from './work-order.service.js';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { AccessTokenPayload } from '../auth/auth.types.js';
import type { UserService } from '../user/user.service.js';
import { WorkOrderStatus } from './work-order.types.js';

describe('WorkOrderService', () => {
  const userService = {} as UserService;

  const dispatcher: AccessTokenPayload = {
    sub: 'dispatcher-id',
    role: 'dispatcher',
    iat: 0,
    exp: 0,
  };

  const technician: AccessTokenPayload = {
    sub: 'technician-id',
    role: 'technician',
    iat: 0,
    exp: 0,
  };

  describe('findAll', () => {
    it('should return work orders from Prisma', async () => {
      const workOrders = [
        {
          id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
          title: 'Repair leaking pipe',
          customerName: 'Ama Mensah',
          status: 'open',
          createdAt: '2026-09-07T10:00:00.000Z',
          updatedAt: '2026-09-07T10:00:00.000Z',
        },
      ];

      const all = vi.fn(async () => workOrders);

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                all,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      const result = await service.findAll(dispatcher);

      expect(result).toEqual(workOrders);
      expect(all).toHaveBeenCalledOnce();
    });

    it('should filter work orders by technician assignment', async () => {
      const workOrders = [
        {
          id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
          title: 'Repair leaking pipe',
          customerName: 'Ama Mensah',
          status: 'open',
          assignedTechnicianId: technician.sub,
          createdAt: '2026-09-07T10:00:00.000Z',
          updatedAt: '2026-09-07T10:00:00.000Z',
        },
      ];

      const all = vi.fn(async () => workOrders);
      const where = vi.fn(() => ({ all }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: { where },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);
      const result = await service.findAll(technician);

      expect(result).toEqual(workOrders);
      expect(where).toHaveBeenCalledWith({
        assignedTechnicianId: technician.sub,
      });
      expect(all).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a work order from Prisma', async () => {
      const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';

      const workOrder = {
        id,
        title: 'Repair leaking pipe',
        customerName: 'Ama Mensah',
        status: 'open',
        createdAt: '2026-09-07T10:00:00.000Z',
        updatedAt: '2026-09-07T10:00:00.000Z',
      };

      const first = vi.fn(async () => workOrder);

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                first,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      const result = await service.findOne(id, dispatcher);

      expect(result).toEqual(workOrder);
      expect(first).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException if work order is not found', async () => {
      const id = 'non-existent-id';

      const first = vi.fn(async () => null);

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                first,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      await expect(service.findOne(id, dispatcher)).rejects.toThrow(
        NotFoundException,
      );

      expect(first).toHaveBeenCalledWith({ id });
    });
  });

  describe('create', () => {
    it('should create a work order in Prisma', async () => {
      const body = {
        title: 'Repair leaking pipe',
        customerName: 'Ama Mensah',
      };

      const createdWorkOrder = {
        id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
        ...body,
        status: 'open',
        createdAt: '2026-09-07T10:00:00.000Z',
        updatedAt: '2026-09-07T10:00:00.000Z',
      };

      const create = vi.fn(async () => createdWorkOrder);

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                create,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      const result = await service.create(body);

      expect(result).toEqual(createdWorkOrder);
      expect(create).toHaveBeenCalledWith({
        title: body.title,
        customerName: body.customerName,
      });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when the work order does not exist', async () => {
      const id = 'non-existent-id';
      const body = {
        title: 'Fix broken window',
      };

      const update = vi.fn(async () => null);
      const where = vi.fn(() => ({
        update,
      }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                where,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      await expect(service.update(id, body)).rejects.toThrow(NotFoundException);

      expect(where).toHaveBeenCalledWith({ id });
      expect(update).toHaveBeenCalledWith({
        title: body.title,
      });
    });

    it('should update only the title of a work order in Prisma', async () => {
      const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
      const body = {
        title: 'Fix broken window',
      };

      const updatedWorkOrder = {
        id,
        title: body.title,
        customerName: 'Ama Mensah',
        status: 'open',
        createdAt: '2026-09-07T10:00:00.000Z',
        updatedAt: '2026-09-07T10:00:00.000Z',
      };

      const update = vi.fn(async () => updatedWorkOrder);
      const where = vi.fn(() => ({
        update,
      }));
      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                where,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      const result = await service.update(id, body);

      expect(result).toEqual(updatedWorkOrder);
      expect(update).toHaveBeenCalledWith({
        title: body.title,
      });
      expect(where).toHaveBeenCalledWith({ id });
    });

    it('should update a work order in Prisma', async () => {
      const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
      const body = {
        title: 'Fix broken window',
        customerName: 'Kofi Asante',
      };

      const updatedWorkOrder = {
        id,
        ...body,
        status: 'open',
        createdAt: '2026-09-07T10:00:00.000Z',
        updatedAt: '2026-09-07T10:00:00.000Z',
      };

      const update = vi.fn(async () => updatedWorkOrder);

      const where = vi.fn(() => ({
        update,
      }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                where,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      const result = await service.update(id, body);

      expect(result).toEqual(updatedWorkOrder);
      expect(update).toHaveBeenCalledWith({
        title: body.title,
        customerName: body.customerName,
      });
      expect(where).toHaveBeenCalledWith({ id });
    });
  });

  describe('updateStatus', () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';

    it('should prevent technicians from cancelling work orders', async () => {
      const first = vi.fn(async () => ({
        id,
        status: WorkOrderStatus.IN_PROGRESS,
        assignedTechnicianId: technician.sub,
      }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: { first },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      await expect(
        service.updateStatus(id, WorkOrderStatus.CANCELLED, technician),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject an invalid status transition', async () => {
      const first = vi.fn(async () => ({
        id,
        status: WorkOrderStatus.OPEN,
      }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: { first },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(prisma, userService);

      await expect(
        service.updateStatus(id, WorkOrderStatus.COMPLETED, dispatcher),
      ).rejects.toThrow(ConflictException);
    });
  });
});
