import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();
    const existingUser = await this.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }
    const passwordHash = await argon2.hash(createUserDto.password, {
      type: argon2.argon2id,
    });

    return this.prisma.client.orm.public.User.select(
      'id',
      'displayName',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    ).create({
      displayName: createUserDto.displayName.trim() as Varchar<120>,
      email: normalizedEmail as Varchar<255>,
      passwordHash: passwordHash as Varchar<255>,
    });
  }

  async findAll() {
    return await this.prisma.client.orm.public.User.select(
      'id',
      'displayName',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    ).all();
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return this.prisma.client.orm.public.User.first({
      email: normalizedEmail as Varchar<255>,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.orm.public.User.select(
      'id',
      'displayName',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    )
      .where({
        id,
      })
      .first();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
