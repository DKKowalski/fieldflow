import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateServiceLocationDto } from './create-service-location.dto.js';

export class UpdateServiceLocationDto extends PartialType(
  OmitType(CreateServiceLocationDto, ['customerId'] as const),
) {}
