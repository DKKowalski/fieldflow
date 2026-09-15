import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsUUID()
  serviceLocationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
