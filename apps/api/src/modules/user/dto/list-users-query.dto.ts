import { IsIn, IsOptional } from 'class-validator';
import type { UserRole } from '../../auth/auth.types.js';

export class ListUsersQueryDto {
  @IsOptional()
  @IsIn(['dispatcher', 'technician'])
  role?: UserRole;
}
