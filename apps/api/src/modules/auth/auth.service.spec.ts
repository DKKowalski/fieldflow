import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const userServiceMock = {
      create: vi.fn(),
    };
    const jwtServiceMock = {
      signAsync: vi.fn(),
    };


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
