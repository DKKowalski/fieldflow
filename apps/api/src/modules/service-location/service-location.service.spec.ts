import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../prisma/prisma.service.js';
import type { CustomerService } from '../customer/customer.service.js';
import { ServiceLocationService } from './service-location.service.js';

describe('ServiceLocationService', () => {
  const customerService = {} as CustomerService;

  it('should normalize and create a location for an existing customer', async () => {
    const body = {
      customerId: '9c36bcba-7a48-46ac-9c64-e9b875988634',
      label: '  Main office  ',
      addressLine1: '  12 Independence Avenue  ',
      addressLine2: '  Second floor  ',
      city: '  Accra  ',
      region: '  Greater Accra  ',
      postalCode: '  GA-123-4567  ',
    };
    const customer = {
      id: body.customerId,
      name: 'Ama Mensah',
    };
    const createdLocation = {
      id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
      customerId: customer.id,
      label: 'Main office',
      addressLine1: '12 Independence Avenue',
      addressLine2: 'Second floor',
      city: 'Accra',
      region: 'Greater Accra',
      postalCode: 'GA-123-4567',
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T10:00:00.000Z',
    };

    const create = vi.fn(async () => createdLocation);
    const findOne = vi.fn(async () => customer);
    const mockCustomerService = {
      findOne,
    } as unknown as CustomerService;
    const prisma = {
      client: {
        orm: {
          public: {
            ServiceLocation: { create },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new ServiceLocationService(prisma, mockCustomerService);
    const result = await service.create(body);

    expect(result).toEqual(createdLocation);
    expect(findOne).toHaveBeenCalledWith(body.customerId);
    expect(create).toHaveBeenCalledWith({
      customerId: customer.id,
      label: 'Main office',
      addressLine1: '12 Independence Avenue',
      addressLine2: 'Second floor',
      city: 'Accra',
      region: 'Greater Accra',
      postalCode: 'GA-123-4567',
    });
  });

  it('should return all service locations', async () => {
    const locations = [
      {
        id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
        customerId: '9c36bcba-7a48-46ac-9c64-e9b875988634',
        label: 'Main office',
        addressLine1: '12 Independence Avenue',
        addressLine2: null,
        city: 'Accra',
        region: 'Greater Accra',
        postalCode: null,
        createdAt: '2026-09-14T10:00:00.000Z',
        updatedAt: '2026-09-14T10:00:00.000Z',
      },
    ];
    const all = vi.fn(async () => locations);
    const prisma = {
      client: {
        orm: {
          public: {
            ServiceLocation: { all },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new ServiceLocationService(prisma, customerService);
    const result = await service.findAll();

    expect(result).toEqual(locations);
    expect(all).toHaveBeenCalledOnce();
  });

  it('should return one service location', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const location = {
      id,
      customerId: '9c36bcba-7a48-46ac-9c64-e9b875988634',
      label: 'Main office',
      addressLine1: '12 Independence Avenue',
      addressLine2: null,
      city: 'Accra',
      region: 'Greater Accra',
      postalCode: null,
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T10:00:00.000Z',
    };
    const first = vi.fn(async () => location);
    const prisma = {
      client: {
        orm: {
          public: {
            ServiceLocation: { first },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new ServiceLocationService(prisma, customerService);
    const result = await service.findOne(id);

    expect(result).toEqual(location);
    expect(first).toHaveBeenCalledWith({ id });
  });

  it('should throw when a service location does not exist', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const first = vi.fn(async () => null);
    const prisma = {
      client: {
        orm: {
          public: {
            ServiceLocation: { first },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new ServiceLocationService(prisma, customerService);

    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    expect(first).toHaveBeenCalledWith({ id });
  });

  it('should normalize and update only supplied fields', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const body = {
      label: '  Warehouse  ',
      city: '  Tema  ',
    };
    const updatedLocation = {
      id,
      customerId: '9c36bcba-7a48-46ac-9c64-e9b875988634',
      label: 'Warehouse',
      addressLine1: '12 Independence Avenue',
      addressLine2: null,
      city: 'Tema',
      region: 'Greater Accra',
      postalCode: null,
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T11:00:00.000Z',
    };
    const update = vi.fn(async () => updatedLocation);
    const where = vi.fn(() => ({ update }));
    const prisma = {
      client: {
        orm: {
          public: {
            ServiceLocation: { where },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new ServiceLocationService(prisma, customerService);
    const result = await service.update(id, body);

    expect(result).toEqual(updatedLocation);
    expect(where).toHaveBeenCalledWith({ id });
    expect(update).toHaveBeenCalledWith({
      label: 'Warehouse',
      city: 'Tema',
    });
  });

  it('should throw when updating a missing service location', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const update = vi.fn(async () => null);
    const where = vi.fn(() => ({ update }));
    const prisma = {
      client: {
        orm: {
          public: {
            ServiceLocation: { where },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new ServiceLocationService(prisma, customerService);

    await expect(service.update(id, { label: 'Warehouse' })).rejects.toThrow(
      NotFoundException,
    );
    expect(where).toHaveBeenCalledWith({ id });
  });

});
