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
import type { ServiceLocationService } from '../service-location/service-location.service.js';

describe('WorkOrderService', () => {
  const userService = {} as UserService;
  const serviceLocationService = {} as ServiceLocationService;

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
          serviceLocationId: '5d757df6-5361-4553-a392-c808041595da',
          status: 'open',
          serviceLocation: {
            id: '5d757df6-5361-4553-a392-c808041595da',
            label: 'Main office',
            customer: {
              id: '9c36bcba-7a48-46ac-9c64-e9b875988634',
              name: 'Ama Mensah',
              phone: '+233 24 123 4567',
              email: 'ama@example.com',
            },
          },
          createdAt: '2026-09-07T10:00:00.000Z',
          updatedAt: '2026-09-07T10:00:00.000Z',
        },
      ];

      const all = vi.fn(async () => workOrders);
      const selectCustomer = vi.fn(() => ({}));
      const includeCustomer = vi.fn(
        (
          _relation: string,
          configure: (query: { select: typeof selectCustomer }) => unknown,
        ) => {
          configure({ select: selectCustomer });
          return {};
        },
      );
      const include = vi.fn(
        (
          _relation: string,
          configure: (query: { include: typeof includeCustomer }) => unknown,
        ) => {
          configure({ include: includeCustomer });
          return { all };
        },
      );

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                include,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );

      const result = await service.findAll(dispatcher);

      expect(result).toEqual(workOrders);
      expect(include).toHaveBeenCalledWith(
        'serviceLocation',
        expect.any(Function),
      );
      expect(includeCustomer).toHaveBeenCalledWith(
        'customer',
        expect.any(Function),
      );
      expect(selectCustomer).toHaveBeenCalledWith(
        'id',
        'name',
        'phone',
        'email',
      );
      expect(all).toHaveBeenCalledOnce();
    });

    it('should filter work orders by technician assignment', async () => {
      const workOrders = [
        {
          id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
          title: 'Repair leaking pipe',
          serviceLocationId: '5d757df6-5361-4553-a392-c808041595da',
          status: 'open',
          assignedTechnicianId: technician.sub,
          createdAt: '2026-09-07T10:00:00.000Z',
          updatedAt: '2026-09-07T10:00:00.000Z',
        },
      ];

      const all = vi.fn(async () => workOrders);
      const where = vi.fn(() => ({ all }));
      const include = vi.fn(() => ({ where }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: { include },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );
      const result = await service.findAll(technician);

      expect(result).toEqual(workOrders);
      expect(where).toHaveBeenCalledWith({
        assignedTechnicianId: technician.sub,
      });
      expect(include).toHaveBeenCalledWith(
        'serviceLocation',
        expect.any(Function),
      );
      expect(all).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a work order from Prisma', async () => {
      const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';

      const workOrder = {
        id,
        title: 'Repair leaking pipe',
        serviceLocationId: '5d757df6-5361-4553-a392-c808041595da',
        status: 'open',
        createdAt: '2026-09-07T10:00:00.000Z',
        updatedAt: '2026-09-07T10:00:00.000Z',
      };

      const first = vi.fn(async () => workOrder);
      const include = vi.fn(() => ({ first }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                include,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );

      const result = await service.findOne(id, dispatcher);

      expect(result).toEqual(workOrder);
      expect(include).toHaveBeenCalledWith(
        'serviceLocation',
        expect.any(Function),
      );
      expect(first).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException if work order is not found', async () => {
      const id = 'non-existent-id';

      const first = vi.fn(async () => null);
      const include = vi.fn(() => ({ first }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: {
                include,
              },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );

      await expect(service.findOne(id, dispatcher)).rejects.toThrow(
        NotFoundException,
      );

      expect(first).toHaveBeenCalledWith({ id });
    });
  });

  describe('create', () => {
    it('should create a work order for an existing service location', async () => {
      const body = {
        title: '  Repair leaking pipe  ',
        serviceLocationId: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
      };

      const serviceLocation = {
        id: body.serviceLocationId,
        customerId: '9c36bcba-7a48-46ac-9c64-e9b875988634',
      };

      const createdWorkOrder = {
        id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
        title: 'Repair leaking pipe',
        serviceLocationId: serviceLocation.id,
        status: 'open',
        createdAt: '2026-09-07T10:00:00.000Z',
        updatedAt: '2026-09-07T10:00:00.000Z',
      };

      const create = vi.fn(async () => createdWorkOrder);
      const findOne = vi.fn(async () => serviceLocation);
      const mockServiceLocationService = {
        findOne,
      } as unknown as ServiceLocationService;

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

      const service = new WorkOrderService(
        prisma,
        userService,
        mockServiceLocationService,
      );

      const result = await service.create(body);

      expect(result).toEqual(createdWorkOrder);
      expect(findOne).toHaveBeenCalledWith(body.serviceLocationId);
      expect(create).toHaveBeenCalledWith({
        title: 'Repair leaking pipe',
        serviceLocationId: serviceLocation.id,
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

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );

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
        serviceLocationId: '5d757df6-5361-4553-a392-c808041595da',
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

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );

      const result = await service.update(id, body);

      expect(result).toEqual(updatedWorkOrder);
      expect(update).toHaveBeenCalledWith({
        title: body.title,
      });
      expect(where).toHaveBeenCalledWith({ id });
    });

    it('should update a work order with an existing service location', async () => {
      const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
      const body = {
        title: 'Fix broken window',
        serviceLocationId: '5d757df6-5361-4553-a392-c808041595da',
      };

      const serviceLocation = {
        id: body.serviceLocationId,
        customerId: '9c36bcba-7a48-46ac-9c64-e9b875988634',
      };

      const updatedWorkOrder = {
        id,
        title: body.title,
        serviceLocationId: serviceLocation.id,
        status: 'open',
        createdAt: '2026-09-07T10:00:00.000Z',
        updatedAt: '2026-09-07T10:00:00.000Z',
      };

      const update = vi.fn(async () => updatedWorkOrder);
      const findOne = vi.fn(async () => serviceLocation);
      const mockServiceLocationService = {
        findOne,
      } as unknown as ServiceLocationService;

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

      const service = new WorkOrderService(
        prisma,
        userService,
        mockServiceLocationService,
      );

      const result = await service.update(id, body);

      expect(result).toEqual(updatedWorkOrder);
      expect(findOne).toHaveBeenCalledWith(body.serviceLocationId);
      expect(update).toHaveBeenCalledWith({
        title: body.title,
        serviceLocationId: serviceLocation.id,
      });
      expect(where).toHaveBeenCalledWith({ id });
    });

    it('should stop before updating when the service location does not exist', async () => {
      const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
      const serviceLocationId = '5d757df6-5361-4553-a392-c808041595da';
      const update = vi.fn();
      const where = vi.fn(() => ({ update }));
      const findOne = vi.fn(async () => {
        throw new NotFoundException(
          `Service location with ID ${serviceLocationId} not found`,
        );
      });

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: { where },
            },
          },
        },
      } as unknown as PrismaService;

      const mockServiceLocationService = {
        findOne,
      } as unknown as ServiceLocationService;

      const service = new WorkOrderService(
        prisma,
        userService,
        mockServiceLocationService,
      );

      await expect(
        service.update(id, { serviceLocationId }),
      ).rejects.toThrowError(
        `Service location with ID ${serviceLocationId} not found`,
      );

      expect(findOne).toHaveBeenCalledWith(serviceLocationId);
      expect(where).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
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
      const include = vi.fn(() => ({ first }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: { include },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );

      await expect(
        service.updateStatus(id, WorkOrderStatus.CANCELLED, technician),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject an invalid status transition', async () => {
      const first = vi.fn(async () => ({
        id,
        status: WorkOrderStatus.OPEN,
      }));
      const include = vi.fn(() => ({ first }));

      const prisma = {
        client: {
          orm: {
            public: {
              WorkOrder: { include },
            },
          },
        },
      } as unknown as PrismaService;

      const service = new WorkOrderService(
        prisma,
        userService,
        serviceLocationService,
      );

      await expect(
        service.updateStatus(id, WorkOrderStatus.COMPLETED, dispatcher),
      ).rejects.toThrow(ConflictException);
    });
  });
});
