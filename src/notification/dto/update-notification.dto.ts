import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  @IsIn(['read', 'unread'])
  status?: 'read' | 'unread';
}
