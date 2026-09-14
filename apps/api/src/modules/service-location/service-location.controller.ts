import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ServiceLocationService } from './service-location.service.js';
import { CreateServiceLocationDto } from './dto/create-service-location.dto.js';
import { UpdateServiceLocationDto } from './dto/update-service-location.dto.js';
import { Roles } from '../auth/roles.decorator.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';



@UseGuards(AuthGuard, RolesGuard)
@Roles('dispatcher')
@Controller('service-locations')
export class ServiceLocationController {
  constructor(
    private readonly serviceLocationService: ServiceLocationService,

  ) {}

  @Post()
  create(@Body() createServiceLocationDto: CreateServiceLocationDto) {
    return this.serviceLocationService.create(createServiceLocationDto);
  }

  @Get()
  findAll() {
    return this.serviceLocationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceLocationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceLocationDto: UpdateServiceLocationDto,
  ) {
    return this.serviceLocationService.update(id, updateServiceLocationDto);
  }
}
