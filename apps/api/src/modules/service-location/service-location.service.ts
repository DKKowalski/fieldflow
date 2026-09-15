import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceLocationDto } from './dto/create-service-location.dto.js';
import { UpdateServiceLocationDto } from './dto/update-service-location.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CustomerService } from '../customer/customer.service.js';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

@Injectable()
export class ServiceLocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerService: CustomerService,
  ) {}

  async create(body: CreateServiceLocationDto) {
    const customer = await this.customerService.findOne(body.customerId);

    return await this.prisma.client.orm.public.ServiceLocation.create({
      customerId: customer.id,
      label: body.label.trim() as Varchar<80>,
      addressLine1: body.addressLine1.trim() as Varchar<160>,
      city: body.city.trim() as Varchar<100>,
      ...(body.addressLine2 !== undefined
        ? { addressLine2: body.addressLine2.trim() as Varchar<160> }
        : {}),
      ...(body.region !== undefined
        ? { region: body.region.trim() as Varchar<100> }
        : {}),
      ...(body.postalCode !== undefined
        ? { postalCode: body.postalCode.trim() as Varchar<20> }
        : {}),
    });
  }

  async findAll(customerId?: string) {
    const query = this.prisma.client.orm.public.ServiceLocation;

    if (customerId !== undefined) {
      return await query.where({ customerId }).all();
    }

    return await query.all();
  }

  async findOne(id: string) {
    const serviceLocation =
      await this.prisma.client.orm.public.ServiceLocation.first({
        id,
      });

    if (!serviceLocation) {
      throw new NotFoundException(`Service location with ID ${id} not found`);
    }

    return serviceLocation;
  }

  async update(id: string, body: UpdateServiceLocationDto) {
    const data = {
      ...(body.label !== undefined
        ? { label: body.label.trim() as Varchar<80> }
        : {}),
      ...(body.addressLine1 !== undefined
        ? {
            addressLine1: body.addressLine1.trim() as Varchar<160>,
          }
        : {}),

      ...(body.addressLine2 !== undefined
        ? {
            addressLine2: body.addressLine2.trim() as Varchar<160>,
          }
        : {}),

      ...(body.city !== undefined
        ? { city: body.city.trim() as Varchar<100> }
        : {}),

      ...(body.region !== undefined
        ? { region: body.region.trim() as Varchar<100> }
        : {}),

      ...(body.postalCode !== undefined
        ? {
            postalCode: body.postalCode.trim() as Varchar<20>,
          }
        : {}),
    };

    const serviceLocation =
      await this.prisma.client.orm.public.ServiceLocation.where({
        id,
      }).update(data);

    if (!serviceLocation) {
      throw new NotFoundException(`Service location with ID ${id} not found`);
    }

    return serviceLocation;
  }
}
