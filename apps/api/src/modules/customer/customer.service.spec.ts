import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { CustomerService } from './customer.service.js';

describe('CustomerService', () => {
  it('should normalize and create a customer', async () => {
    const body = {
      name: '  Ama Mensah  ',
      phone: '  +233 24 123 4567  ',
      email: '  AMA@EXAMPLE.COM  ',
    };

    const createdCustomer = {
      id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
      name: 'Ama Mensah',
      phone: '+233 24 123 4567',
      email: 'ama@example.com',
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T10:00:00.000Z',
    };

    const create = vi.fn(async () => createdCustomer);
    const prisma = {
      client: {
        orm: {
          public: {
            Customer: { create },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new CustomerService(prisma);
    const result = await service.create(body);

    expect(result).toEqual(createdCustomer);
    expect(create).toHaveBeenCalledWith({
      name: 'Ama Mensah',
      phone: '+233 24 123 4567',
      email: 'ama@example.com',
    });
  });

  it('should return all customers', async () => {
    const customers = [
      {
        id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
        name: 'Ama Mensah',
        phone: '+233 24 123 4567',
        email: null,
        createdAt: '2026-09-14T10:00:00.000Z',
        updatedAt: '2026-09-14T10:00:00.000Z',
      },
    ];

    const all = vi.fn(async () => customers);
    const prisma = {
      client: {
        orm: {
          public: {
            Customer: { all },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new CustomerService(prisma);
    const result = await service.findAll();

    expect(result).toEqual(customers);
    expect(all).toHaveBeenCalledOnce();
  });

  it('should return one customer', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const customer = {
      id,
      name: 'Ama Mensah',
      phone: '+233 24 123 4567',
      email: null,
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T10:00:00.000Z',
    };

    const first = vi.fn(async () => customer);
    const prisma = {
      client: {
        orm: {
          public: {
            Customer: { first },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new CustomerService(prisma);
    const result = await service.findOne(id);

    expect(result).toEqual(customer);
    expect(first).toHaveBeenCalledWith({ id });
  });

  it('should throw when a customer does not exist', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const first = vi.fn(async () => null);
    const prisma = {
      client: {
        orm: {
          public: {
            Customer: { first },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new CustomerService(prisma);

    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    expect(first).toHaveBeenCalledWith({ id });
  });

  it('should normalize and update only supplied fields', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const body = {
      name: '  Ama Boateng  ',
      email: '  AMA.BOATENG@EXAMPLE.COM  ',
    };
    const updatedCustomer = {
      id,
      name: 'Ama Boateng',
      phone: '+233 24 123 4567',
      email: 'ama.boateng@example.com',
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T11:00:00.000Z',
    };

    const update = vi.fn(async () => updatedCustomer);
    const where = vi.fn(() => ({ update }));
    const prisma = {
      client: {
        orm: {
          public: {
            Customer: { where },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new CustomerService(prisma);
    const result = await service.update(id, body);

    expect(result).toEqual(updatedCustomer);
    expect(where).toHaveBeenCalledWith({ id });
    expect(update).toHaveBeenCalledWith({
      name: 'Ama Boateng',
      email: 'ama.boateng@example.com',
    });
  });

  it('should throw when updating a missing customer', async () => {
    const id = '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f';
    const update = vi.fn(async () => null);
    const where = vi.fn(() => ({ update }));
    const prisma = {
      client: {
        orm: {
          public: {
            Customer: { where },
          },
        },
      },
    } as unknown as PrismaService;

    const service = new CustomerService(prisma);

    await expect(
      service.update(id, { phone: '+233 20 000 0000' }),
    ).rejects.toThrow(NotFoundException);
    expect(where).toHaveBeenCalledWith({ id });
  });
});
