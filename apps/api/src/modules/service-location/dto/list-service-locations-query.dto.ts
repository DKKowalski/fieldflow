import { IsOptional, IsUUID } from 'class-validator';

export class ListServiceLocationsQueryDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
