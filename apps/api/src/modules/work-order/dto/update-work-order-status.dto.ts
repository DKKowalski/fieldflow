import { IsEnum } from 'class-validator';

import { WorkOrderStatus } from '../work-order.types.js';

export class UpdateWorkOrderStatusDto {
  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;
}
