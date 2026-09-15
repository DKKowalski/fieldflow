import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { vi } from 'vitest';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should filter users by role without returning password hashes', async () => {
    const users = [
      {
        id: '844ea13a-bfb2-4b4a-a7c4-56f93f50f69f',
        displayName: 'Kwame Ansah',
        email: 'kwame@example.com',
        role: 'technician',
      },
    ];
    const all = vi.fn(async () => users);
    const where = vi.fn(() => ({ all }));
    const select = vi.fn(() => ({ where }));
    const prisma = {
      client: {
        orm: {
          public: {
            User: { select },
          },
        },
      },
    } as unknown as PrismaService;
    const filteredService = new UserService(prisma);

    const result = await filteredService.findAll('technician');

    expect(result).toEqual(users);
    expect(select).toHaveBeenCalledWith(
      'id',
      'displayName',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    );
    expect(where).toHaveBeenCalledWith({ role: 'technician' });
    expect(all).toHaveBeenCalledOnce();
  });
});
