import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateServiceLocationDto {
  @IsUUID()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  label: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}
