import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateCustomerDto) {
    return await this.prisma.client.orm.public.Customer.create({
      name: body.name.trim() as Varchar<120>,
      phone: body.phone.trim() as Varchar<30>,
      ...(body.email !== undefined
        ? {
            email: body.email.trim().toLowerCase() as Varchar<255>,
          }
        : {}),
    });
  }

  async findAll() {
    return await this.prisma.client.orm.public.Customer.all();
  }

  async findOne(id: string) {
    const customer = await this.prisma.client.orm.public.Customer.first({
      id,
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, body: UpdateCustomerDto) {
    const normalizedData = {
      ...(body.name !== undefined
        ? { name: body.name.trim() as Varchar<120> }
        : {}),
      ...(body.phone !== undefined
        ? { phone: body.phone.trim() as Varchar<30> }
        : {}),
      ...(body.email !== undefined
        ? {
            email: body.email.trim().toLowerCase() as Varchar<255>,
          }
        : {}),
    };

    const customer = await this.prisma.client.orm.public.Customer.where({
      id,
    }).update(normalizedData);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }
}
