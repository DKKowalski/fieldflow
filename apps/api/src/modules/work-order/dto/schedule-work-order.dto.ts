import { IsISO8601 } from 'class-validator';

export class ScheduleWorkOrderDto {
  @IsISO8601()
  scheduledStartAt: string;

  @IsISO8601()
  scheduledEndAt: string;
}
