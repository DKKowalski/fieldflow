import { IsEnum, IsOptional } from 'class-validator';
import { WorkOrderStatus } from '../work-order.types.js';

export class ListWorkOrdersQueryDto {
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;
}
