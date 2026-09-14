import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ROLES_KEY } from '../auth/roles.decorator.js';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findOne: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('requires the dispatcher role for every route', () => {
    const reflector = new Reflector();

    expect(reflector.get(ROLES_KEY, UserController)).toEqual(['dispatcher']);
  });
});
